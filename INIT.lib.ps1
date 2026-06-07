#Requires -Version 7.0
<#
.SYNOPSIS
	Shared library for the template tooling (INIT.ps1 / REMOVE-PRISMA.ps1).

.DESCRIPTION
	Provides the reliability core used by both scripts:
	  - UTF-8 (no BOM) file I/O with full accent (tildes) support.
	  - A consistent, colorized console UI.
	  - Interactive prompt helpers.
	  - A temporary journal (.init-tmp/) that backs up every touched file so the
	    run can be rolled back or resumed without git.
	  - Structural editors for JSON and text/markdown so edits stay correct.

	This file is dot-sourced; it never runs anything on its own. State shared
	with the host script lives in $script:Init* variables set by Initialize-Journal.
#>

Set-StrictMode -Version Latest

# SECTION: shared state

$script:InitUtf8 = [System.Text.UTF8Encoding]::new($false)
$script:InitDryRun = $false
$script:InitRoot = (Get-Location).Path
$script:InitTmpDir = $null
$script:InitJournalPath = $null
$script:InitColor = $true

# Make the console speak UTF-8 so Read-Host captures "á é í ó ú ñ" intact and
# our writes round-trip. Guarded: some hosts (CI, redirected) reject this.
try {
	[Console]::InputEncoding = $script:InitUtf8
	[Console]::OutputEncoding = $script:InitUtf8
	$OutputEncoding = $script:InitUtf8
} catch {
	# non-interactive host — encoding already fine or not settable; ignore.
}
if (-not $Host.UI.SupportsVirtualTerminal -and -not $env:WT_SESSION) {
	# best-effort; colors still work in most modern terminals.
}

# SECTION: console ui
#
# Visual language (refines scripts/reset-iris.ps1 of the IRIS template):
#   • Boxed banner whose colour reflects state (info=cyan, ok=green, error=red).
#   • Numbered phase rules:  ──[ 2/4 ]── Title ─────────────────────────
#   • Status lines with width-1 glyphs (✓ ⚠ ✗ · ▸ ◇) so columns stay aligned.
#   • Aligned key→value rows for summaries, and  →  arrows for next steps.
# Rule: never put width-2 emoji inside a centered/bordered line — it breaks the
# box alignment. Glyphs here are all BMP symbols (display width 1).

$script:UiWidth = 62   # width of phase rules and banners

function Write-Ui {
	param(
		[Parameter(Mandatory)][AllowEmptyString()][string]$Text,
		[string]$Color = 'Gray',
		[switch]$NoNewline
	)
	if ($script:InitColor) {
		Write-Host $Text -ForegroundColor $Color -NoNewline:$NoNewline
	} else {
		Write-Host $Text -NoNewline:$NoNewline
	}
}

function Write-Banner {
	# Boxed, centered title. $State drives the colour. Keep $Text emoji-free.
	param(
		[Parameter(Mandatory)][string]$Text,
		[ValidateSet('info', 'ok', 'error')][string]$State = 'info'
	)
	$color = switch ($State) { 'ok' { 'Green' } 'error' { 'Red' } default { 'Cyan' } }
	$inner = $script:UiWidth - 2
	$text = $Text.Trim()
	if ($text.Length -gt $inner) { $text = $text.Substring(0, $inner) }
	$pad = $inner - $text.Length
	$left = [Math]::Floor($pad / 2)
	Write-Host ''
	Write-Ui ('╔' + ('═' * $inner) + '╗') $color
	Write-Ui ('║' + (' ' * $left) + $text + (' ' * ($pad - $left)) + '║') $color
	Write-Ui ('╚' + ('═' * $inner) + '╝') $color
}

function Write-Phase {
	# Section rule. With -Step/-Of: ──[ 2/4 ]── Title ───. Without: ── Title ───.
	param(
		[Parameter(Mandatory)][string]$Title,
		[int]$Step = 0,
		[int]$Of = 0
	)
	$prefix = ($Step -gt 0 -and $Of -gt 0) ? "──[ $Step/$Of ]── $Title " : "── $Title "
	$fill = [Math]::Max(0, $script:UiWidth - $prefix.Length)
	Write-Host ''
	Write-Ui ($prefix + ('─' * $fill)) 'Cyan'
}

# status lines — glyphs are width-1 so they line up in a left gutter
function Write-Item { param([string]$Glyph, [string]$Color, [string]$Text) Write-Ui "  $Glyph $Text" $Color }
function Write-Ok { param([Parameter(Mandatory)][string]$Text) Write-Item '✓' 'Green' $Text }
function Write-Warn { param([Parameter(Mandatory)][string]$Text) Write-Item '⚠' 'Yellow' $Text }
function Write-Err { param([Parameter(Mandatory)][string]$Text) Write-Item '✗' 'Red' $Text }
function Write-Info { param([Parameter(Mandatory)][string]$Text) Write-Item '·' 'DarkGray' $Text }
function Write-Run { param([Parameter(Mandatory)][string]$Text) Write-Item '▸' 'Cyan' $Text }
function Write-Dry { param([Parameter(Mandatory)][string]$Text) Write-Item '◇' 'Magenta' "[dry-run] $Text" }

function Write-Field {
	# Aligned "Label › Value" echo (used for the collected-input recap).
	param([Parameter(Mandatory)][string]$Label, [string]$Value, [int]$Width = 14)
	Write-Ui ("  {0} › {1}" -f $Label.PadRight($Width), $Value) 'Gray'
}

function Write-Map {
	# Aligned summary row:  Label   Value            →  Mapped
	param([string]$Label, [string]$Value, [string]$To = '', [int]$LabelW = 12, [int]$ValueW = 18)
	$line = "  {0} {1}" -f $Label.PadRight($LabelW), ([string]$Value).PadRight($ValueW)
	if ($To) { $line += " →  $To" }
	Write-Ui ($line.TrimEnd()) 'Cyan'
}

function Write-Next { param([Parameter(Mandatory)][string]$Text) Write-Ui "  →  $Text" 'White' }

# SECTION: interactive prompts

function Read-Field {
	param(
		[Parameter(Mandatory)][string]$Prompt,
		[string]$Default = '',
		[string]$Description = '',
		[bool]$Required = $true,
		[scriptblock]$Validate
	)

	# A dim hint line, then the prompt. Read-Host appends ": " itself, so a single
	# space follows the label. Optional fields carry a "(opcional)" tag.
	if ($Description) { Write-Ui "  · $Description" 'DarkGray' }

	while ($true) {
		$lbl = $Required ? $Prompt : "$Prompt (opcional)"
		$label = $Default ? ("  {0} [{1}]" -f $lbl, $Default) : ("  {0}" -f $lbl)
		$answer = Read-Host $label
		if ([string]::IsNullOrWhiteSpace($answer) -and $Default) { $answer = $Default }
		$answer = $answer.Trim()

		if ($Required -and [string]::IsNullOrWhiteSpace($answer)) {
			Write-Warn 'Este campo es obligatorio.'
			continue
		}
		if ($answer -and $Validate) {
			$problem = & $Validate $answer
			if ($problem) { Write-Warn $problem; continue }
		}
		return $answer
	}
}

function Read-Confirm {
	param(
		[Parameter(Mandatory)][string]$Prompt,
		[bool]$Default = $false
	)
	$hint = $Default ? '(Y/n)' : '(y/N)'
	$answer = (Read-Host ("  {0} {1}" -f $Prompt, $hint)).Trim()
	if ([string]::IsNullOrWhiteSpace($answer)) { return $Default }
	return $answer -match '^(y|yes|s|si|sí)$'
}

function Read-Choice {
	# Numbered single-select. Enter accepts $Default (if given). Returns the chosen option.
	param(
		[Parameter(Mandatory)][string]$Prompt,
		[Parameter(Mandatory)][string[]]$Options,
		[string]$Default = '',
		[string]$Description = ''
	)
	if ($Description) { Write-Ui "  · $Description" 'DarkGray' }
	for ($i = 0; $i -lt $Options.Count; $i++) {
		$mark = ($Options[$i] -eq $Default) ? '  (Enter)' : ''
		Write-Ui ("    {0}. {1}{2}" -f ($i + 1), $Options[$i], $mark) 'Gray'
	}
	while ($true) {
		$answer = (Read-Host ("  {0} [1-{1}]" -f $Prompt, $Options.Count)).Trim()
		if (-not $answer -and $Default) {
			$idx = [array]::IndexOf($Options, $Default)
			if ($idx -ge 0) { return $Options[$idx] }
		}
		$n = 0
		if ([int]::TryParse($answer, [ref]$n) -and $n -ge 1 -and $n -le $Options.Count) { return $Options[$n - 1] }
		Write-Warn "Seleccione una opción válida (1-$($Options.Count))."
	}
}

# SECTION: text transforms (accent-aware)

function ConvertTo-AsciiFold {
	# Strips diacritics: "Atención" -> "Atencion". Used for URLs / package names.
	param([string]$Text)
	if ([string]::IsNullOrWhiteSpace($Text)) { return $Text }
	$normalized = $Text.Normalize([Text.NormalizationForm]::FormD)
	$sb = [Text.StringBuilder]::new()
	foreach ($ch in $normalized.ToCharArray()) {
		if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
			[void]$sb.Append($ch)
		}
	}
	return $sb.ToString().Normalize([Text.NormalizationForm]::FormC)
}

function ConvertTo-KebabCase {
	param([string]$Text)
	if ([string]::IsNullOrWhiteSpace($Text)) { return $Text }
	$ascii = (ConvertTo-AsciiFold $Text).ToLowerInvariant()
	$ascii = $ascii -replace '[^a-z0-9]+', '-'
	$ascii = $ascii -replace '(^-+|-+$)', ''
	return $ascii -replace '-{2,}', '-'
}

function ConvertTo-PascalCase {
	param([string]$Text)
	if ([string]::IsNullOrWhiteSpace($Text)) { return $Text }
	$words = (ConvertTo-AsciiFold $Text) -split '[^a-zA-Z0-9]+' | Where-Object { $_ }
	return (($words | ForEach-Object { $_.Substring(0, 1).ToUpperInvariant() + $_.Substring(1).ToLowerInvariant() }) -join '')
}

function ConvertTo-TitleCase {
	# Title-cases while keeping accents and leaving connectors lowercase (except as
	# the first word): "modulo de atención" -> "Módulo de Atención".
	param([string]$Text)
	if ([string]::IsNullOrWhiteSpace($Text)) { return $Text }
	$small = @('de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'u', 'en', 'con', 'a',
		'the', 'of', 'and', 'or', 'in', 'on', 'for', 'to')
	$ti = (Get-Culture).TextInfo
	# @() forces an array even for a single word, so .Count / indexing are safe under StrictMode
	$words = @($Text.ToLowerInvariant() -split '\s+' | Where-Object { $_ })
	$out = for ($i = 0; $i -lt $words.Count; $i++) {
		($i -gt 0 -and $small -contains $words[$i]) ? $words[$i] : $ti.ToTitleCase($words[$i])
	}
	return ($out -join ' ')
}

function ConvertTo-UrlPath {
	# Normalizes a user-typed URL path to canonical "/seg/seg" form, tolerating any
	# slash mess: "api", "/api", "api/", "api//x", "\api\x" → "/api", "/api/x".
	# Empty input falls back to $Default. Never returns a trailing slash.
	param([string]$Text, [string]$Default = 'api')
	$p = ([string]$Text).Trim() -replace '\\', '/' -replace '/{2,}', '/'
	$p = $p.Trim('/')
	if (-not $p) { $p = $Default.Trim('/') }
	return '/' + $p
}

# SECTION: journal (temporary memory — backup / rollback / resume)

function Initialize-Journal {
	param(
		[string]$Root = (Get-Location).Path,
		[switch]$DryRun,
		[string]$Owner = 'init'
	)
	$script:InitRoot = $Root
	$script:InitDryRun = [bool]$DryRun
	$script:InitTmpDir = Join-Path $Root '.init-tmp'
	$script:InitJournalPath = Join-Path $script:InitTmpDir 'journal.json'

	if ($script:InitDryRun) { return }

	if (-not (Test-Path $script:InitTmpDir)) {
		New-Item -ItemType Directory -Path $script:InitTmpDir -Force | Out-Null
		New-Item -ItemType Directory -Path (Join-Path $script:InitTmpDir 'backup') -Force | Out-Null
	}
	if (-not (Test-Path $script:InitJournalPath)) {
		$journal = [ordered]@{
			started = (Get-Date).ToString('o')
			owner = $Owner
			entries = @()
		}
		Write-RawJson $script:InitJournalPath $journal
	}
}

function Test-JournalExists {
	return ($script:InitJournalPath -and (Test-Path $script:InitJournalPath))
}

function Add-JournalEntry {
	param([Parameter(Mandatory)][hashtable]$Entry)
	if ($script:InitDryRun) { return }
	$journal = Get-Content $script:InitJournalPath -Raw | ConvertFrom-Json
	$list = [System.Collections.Generic.List[object]]::new()
	foreach ($e in $journal.entries) { $list.Add($e) }
	$list.Add([pscustomobject]$Entry)
	$journal.entries = $list.ToArray()
	Write-RawJson $script:InitJournalPath $journal
}

function Get-BackupPath {
	param([Parameter(Mandatory)][string]$RelativePath)
	$safe = $RelativePath -replace '[\\/]', '__'
	return Join-Path (Join-Path $script:InitTmpDir 'backup') $safe
}

function Get-RelativePath {
	param([Parameter(Mandatory)][string]$Path)
	$full = [IO.Path]::IsPathRooted($Path) `
		? [IO.Path]::GetFullPath($Path) `
		: [IO.Path]::GetFullPath((Join-Path $script:InitRoot $Path))
	$rootFull = [IO.Path]::GetFullPath($script:InitRoot)
	if ($full.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) {
		return $full.Substring($rootFull.Length).TrimStart('\', '/')
	}
	return $Path
}

function Backup-Item {
	# Snapshots a file/dir into the journal the first time it is touched.
	param([Parameter(Mandatory)][string]$Path)
	if ($script:InitDryRun) { return }
	$rel = Get-RelativePath $Path
	$backup = Get-BackupPath $rel
	if (Test-Path $backup) { return }            # already snapshotted
	if (-not (Test-Path $Path)) {
		# track a not-existed marker so rollback can delete a created file
		Add-JournalEntry @{ path = $rel; kind = 'created' }
		return
	}
	$item = Get-Item $Path
	if ($item.PSIsContainer) {
		Copy-Item $Path $backup -Recurse -Force
		Add-JournalEntry @{ path = $rel; kind = 'dir' }
	} else {
		$parent = Split-Path $backup -Parent
		if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
		Copy-Item $Path $backup -Force
		Add-JournalEntry @{ path = $rel; kind = 'file' }
	}
}

function Invoke-Rollback {
	if (-not (Test-JournalExists)) {
		Write-Warn 'No hay journal (.init-tmp) para revertir.'
		return $false
	}
	$journal = Get-Content $script:InitJournalPath -Raw | ConvertFrom-Json
	# replay in reverse so the earliest snapshot wins
	$entries = @($journal.entries)
	[array]::Reverse($entries)
	foreach ($e in $entries) {
		$target = Join-Path $script:InitRoot $e.path
		switch ($e.kind) {
			'created' {
				if (Test-Path $target) { Remove-Item $target -Recurse -Force }
				Write-Ok "revertido (eliminado lo creado): $($e.path)"
			}
			default {
				$backup = Get-BackupPath $e.path
				if (Test-Path $backup) {
					if (Test-Path $target) { Remove-Item $target -Recurse -Force }
					$parent = Split-Path $target -Parent
					if ($parent -and -not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
					Copy-Item $backup $target -Recurse -Force
					Write-Ok "restaurado: $($e.path)"
				}
			}
		}
	}
	Remove-Item $script:InitTmpDir -Recurse -Force -ErrorAction SilentlyContinue
	Write-Ok 'Rollback completado. .init-tmp eliminado.'
	return $true
}

function Complete-Journal {
	# Removes the temporary memory after a successful run.
	param([switch]$Keep)
	if ($script:InitDryRun) { return }
	if ($Keep) {
		Write-Info "Journal conservado en: $($script:InitTmpDir)"
		return
	}
	if ($script:InitTmpDir -and (Test-Path $script:InitTmpDir)) {
		Remove-Item $script:InitTmpDir -Recurse -Force -ErrorAction SilentlyContinue
	}
}

# SECTION: file i/o (utf-8, no bom, journaled)

function Read-TextFile {
	param([Parameter(Mandatory)][string]$Path)
	return [IO.File]::ReadAllText($Path, $script:InitUtf8)
}

function Write-TextFile {
	param(
		[Parameter(Mandatory)][string]$Path,
		[Parameter(Mandatory)][AllowEmptyString()][string]$Content
	)
	if ($script:InitDryRun) {
		Write-Dry "escribiría $((Get-RelativePath $Path))"
		return
	}
	Backup-Item $Path
	[IO.File]::WriteAllText($Path, $Content, $script:InitUtf8)
}

function Write-RawJson {
	# Internal: writes the journal itself (never journaled / dry-run-exempt).
	param([Parameter(Mandatory)][string]$Path, [Parameter(Mandatory)]$Object)
	$json = $Object | ConvertTo-Json -Depth 50
	[IO.File]::WriteAllText($Path, $json, $script:InitUtf8)
}

function Remove-PathJournaled {
	# Deletes a file/dir after snapshotting it for rollback.
	param([Parameter(Mandatory)][string]$Path)
	$rel = Get-RelativePath $Path
	if (-not (Test-Path $Path)) { return $false }
	if ($script:InitDryRun) {
		Write-Dry "eliminaría $rel"
		return $true
	}
	Backup-Item $Path
	Remove-Item $Path -Recurse -Force
	return $true
}

# SECTION: structural json editors (order-preserving via PSCustomObject)

function Edit-JsonFile {
	# Reads $Path as JSON, runs $Mutator on the PSCustomObject root, writes it back.
	param(
		[Parameter(Mandatory)][string]$Path,
		[Parameter(Mandatory)][scriptblock]$Mutator
	)
	if (-not (Test-Path $Path)) { return $false }
	$obj = Read-TextFile $Path | ConvertFrom-Json
	& $Mutator $obj
	$json = $obj | ConvertTo-Json -Depth 50
	Write-TextFile $Path $json
	return $true
}

function Remove-JsonProperty {
	# Removes a nested property by path segments, e.g. @('|DEFAULT|','DB').
	param(
		[Parameter(Mandatory)]$Object,
		[Parameter(Mandatory)][string[]]$PathSegments
	)
	$node = $Object
	for ($i = 0; $i -lt $PathSegments.Count - 1; $i++) {
		$seg = $PathSegments[$i]
		if ($null -eq $node -or -not ($node.PSObject.Properties.Name -contains $seg)) { return }
		$node = $node.$seg
	}
	$leaf = $PathSegments[-1]
	if ($node -and ($node.PSObject.Properties.Name -contains $leaf)) {
		$node.PSObject.Properties.Remove($leaf)
	}
}

function Remove-JsonPropertiesMatching {
	# Removes every property of $Object whose name matches $Regex (one level).
	param(
		[Parameter(Mandatory)]$Object,
		[Parameter(Mandatory)][string]$Regex
	)
	$names = @($Object.PSObject.Properties.Name | Where-Object { $_ -match $Regex })
	foreach ($n in $names) { $Object.PSObject.Properties.Remove($n) }
}

function Set-JsonArrayProperty {
	# Replaces an array property keeping only items that do NOT match $Regex.
	param(
		[Parameter(Mandatory)]$Object,
		[Parameter(Mandatory)][string]$Name,
		[Parameter(Mandatory)][string]$Regex
	)
	if (-not ($Object.PSObject.Properties.Name -contains $Name)) { return }
	$kept = @($Object.$Name | Where-Object { $_ -notmatch $Regex })
	$Object.$Name = $kept
}

# SECTION: text / markdown editors (operate on raw string, preserve EOLs)

function Remove-MatchingLines {
	# Drops every line containing $Pattern (regex). EOL style preserved.
	param([Parameter(Mandatory)][string]$Content, [Parameter(Mandatory)][string]$Pattern)
	return [regex]::Replace($Content, "(?m)^[^\r\n]*(?:$Pattern)[^\r\n]*\r?\n?", '')
}

function Remove-TextBlock {
	# Removes from the first line matching $Start up to (excluding) the next line
	# matching $Stop. If $Inclusive, the $Stop line is removed too. If no $Stop is
	# found, removes through end of file.
	param(
		[Parameter(Mandatory)][string]$Content,
		[Parameter(Mandatory)][string]$Start,
		[string]$Stop,
		[switch]$Inclusive
	)
	if ($Stop) {
		$pattern = $Inclusive `
			? "(?ms)^[^\r\n]*(?:$Start).*?^[^\r\n]*(?:$Stop)[^\r\n]*\r?\n?" `
			: "(?ms)^[^\r\n]*(?:$Start).*?(?=^[^\r\n]*(?:$Stop))"
	} else {
		$pattern = "(?ms)^[^\r\n]*(?:$Start).*\z"
	}
	return [regex]::Replace($Content, $pattern, '')
}

function Edit-Text {
	# Literal-by-default replace. Pass -Regex to treat $Find as a regex.
	param(
		[Parameter(Mandatory)][string]$Content,
		[Parameter(Mandatory)][string]$Find,
		[AllowEmptyString()][string]$Replace = '',
		[switch]$Regex
	)
	if ($Regex) { return [regex]::Replace($Content, $Find, $Replace) }
	return $Content.Replace($Find, $Replace)
}

function Compress-BlankLines {
	# Collapses 3+ consecutive newlines into 2 (tidy after block removals).
	param([Parameter(Mandatory)][string]$Content)
	return [regex]::Replace($Content, '(\r?\n){3,}', "`n`n")
}

# SECTION: verification

function Find-Residual {
	# Returns matches of $Pattern under $Root, skipping noise dirs and $Exclude.
	param(
		[Parameter(Mandatory)][string]$Pattern,
		[string]$Root = $script:InitRoot,
		[string[]]$Exclude = @()
	)
	$skipDir = '[\\/](node_modules|\.git|\.init-tmp|dist|build|coverage)[\\/]'
	$results = [System.Collections.Generic.List[string]]::new()
	$files = Get-ChildItem -Path $Root -Recurse -File -ErrorAction SilentlyContinue |
		Where-Object { $_.FullName -notmatch $skipDir -and $_.Name -ne 'pnpm-lock.yaml' }
	foreach ($f in $files) {
		$rel = Get-RelativePath $f.FullName
		if ($Exclude | Where-Object { $rel -like $_ }) { continue }
		$text = [IO.File]::ReadAllText($f.FullName, $script:InitUtf8)
		$lineNo = 0
		foreach ($line in ($text -split "`n")) {
			$lineNo++
			if ($line -match $Pattern) {
				$results.Add("$rel`:$lineNo`: $($line.Trim())")
			}
		}
	}
	return $results
}
