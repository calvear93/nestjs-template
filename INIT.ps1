#Requires -Version 7.0
<#
.SYNOPSIS
	Interactive initializer for the NestJS API template.

.DESCRIPTION
	Guides you through configuring a fresh copy of the template: collects project
	metadata and replaces the (((...))) placeholders across the curated file set
	(package.json, env/appsettings.json, README.md, specs/project.md), then formats
	the result.

	Reliability features (shared via INIT.lib.ps1): UTF-8 (no BOM) I/O with full accent
	support; a .init-tmp/ journal that backs up every file (-Rollback / resume); -DryRun
	to preview; -KeepScripts to keep the scripts + journal for inspection.

.PARAMETER DryRun       Preview every change without writing to disk.
.PARAMETER KeepScripts  Do not self-delete the scripts, and keep the journal. For testing.
.PARAMETER Rollback     Restore the previous run from the .init-tmp/ journal and exit.

.EXAMPLE
	pwsh ./INIT.ps1
.EXAMPLE
	pwsh ./INIT.ps1 -DryRun -KeepScripts
#>

[CmdletBinding()]
param(
	[switch]$DryRun,
	[switch]$KeepScripts,
	[switch]$Rollback
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
. (Join-Path $root 'INIT.lib.ps1')

# SECTION: rollback shortcut

if ($Rollback) {
	Initialize-Journal -Root $root
	Write-Banner 'ROLLBACK · REVERTIR CAMBIOS' info
	[void](Invoke-Rollback)
	return
}

try { Clear-Host } catch { }   # no-op when stdout is redirected (CI / piped)
Write-Banner 'NEST · INICIALIZAR PROYECTO' info
Write-Ui '  Placeholders · README' 'DarkGray'
if ($DryRun) { Write-Dry 'simulación: no se escribirá nada en disco.' }

# resume / previous run
if (-not $DryRun -and (Test-Path (Join-Path $root '.init-tmp'))) {
	Write-Warn 'Se detectó un run previo sin finalizar (.init-tmp).'
	Initialize-Journal -Root $root
	if (Read-Confirm 'Revertir ese run antes de continuar?' $true) { [void](Invoke-Rollback) }
}

Write-Host ''
if (-not (Read-Confirm 'Continuar con la inicialización?' $true)) {
	Write-Err 'Operación cancelada por el usuario.'
	return
}

Initialize-Journal -Root $root -DryRun:$DryRun -Owner 'init'

# ── Phase 1/3 — collect input ──────────────────────────────────────────────

Write-Phase 'Datos del proyecto' 1 3
Write-Ui '  Los campos (opcional) se omiten con Enter.' 'DarkGray'
Write-Host ''
$projectName = Read-Field 'Proyecto' -Description 'Nombre técnico (ej: Ficha Clínica)'
$appName = Read-Field 'Aplicación' -Description 'Nombre de la app (ej: Siniestro)'
$appTitle = Read-Field 'Título' -Description 'Descriptivo (ej: Módulo de Siniestro)'
$appDescription = Read-Field 'Descripción' -Description 'Objetivo breve de la app'
$basePathRaw = Read-Field 'Ruta base' -Required $false -Description 'Segmento bajo /api (ej: siniestro). Vacío = /api'

# derive
$basePath = (($basePathRaw -replace '\\', '/') -replace '/{2,}', '/').Trim('/')
$projectNameKebab = ConvertTo-KebabCase $projectName
$appNameKebab = ConvertTo-KebabCase $appName
$appTitleFormatted = ConvertTo-TitleCase $appTitle

# ── Phase 2/3 — summary + confirm ──────────────────────────────────────────

Write-Phase 'Resumen' 2 3
Write-Map 'Proyecto' $projectName $projectNameKebab
Write-Map 'Aplicación' $appName $appNameKebab
Write-Map 'Título' $appTitle $appTitleFormatted
Write-Map 'Descripción' $appDescription
Write-Map 'Ruta base' "api/$basePath"
Write-Host ''

if (-not (Read-Confirm '¿Configuración correcta?' $true)) {
	Write-Err 'Configuración cancelada.'
	Complete-Journal
	return
}

# ── Phase 3/3 — apply configuration ────────────────────────────────────────

Write-Phase 'Aplicando configuración' 3 3

# placeholder tokens (curated file list; never touches __templates__)
$tokens = [ordered]@{
	'(((project-name)))' = $projectNameKebab
	'(((app-name)))' = $appNameKebab
	'(((app-title)))' = $appTitleFormatted
	'(((app-description)))' = $appDescription
	'(((base-path)))' = $basePath
}
$tokenFiles = @('package.json', 'env/appsettings.json', 'specs/project.md')
foreach ($rel in $tokenFiles) {
	$path = Join-Path $root $rel
	if (-not (Test-Path $path)) { continue }
	$content = Read-TextFile $path
	$orig = $content
	foreach ($token in $tokens.Keys) { $content = $content.Replace($token, $tokens[$token]) }
	if ($content -ne $orig) { Write-TextFile $path $content; Write-Ok $rel }
}

# README — drop the manual "replace these terms" block (now automated), then apply tokens
$readmePath = Join-Path $root 'README.md'
if (Test-Path $readmePath) {
	$readme = Read-TextFile $readmePath
	$readme = Remove-MatchingLines $readme 'INIT\.ps1'              # quick-start callout
	$readme = Remove-MatchingLines $readme '(?i)these terms'        # manual placeholder intro
	$readme = Remove-MatchingLines $readme '^\s*-\s+\x60\(\(\('     # placeholder bullet list
	foreach ($token in $tokens.Keys) { $readme = $readme.Replace($token, $tokens[$token]) }
	Write-TextFile $readmePath $readme
	Write-Ok 'README.md'
}

# format
if (-not $DryRun) {
	try { & pnpm format | Out-Null; Write-Ok 'pnpm format' }
	catch { Write-Warn "pnpm format falló (revisa manualmente): $_" }
} else {
	Write-Info 'formato omitido en dry-run'
}

# cleanup — self-delete the init scripts (quiet)
if (-not $DryRun -and -not $KeepScripts) {
	# drop the now-stale file-nesting entry that points at the init scripts
	$vscodeSettings = Join-Path $root '.vscode/settings.json'
	if (Test-Path $vscodeSettings) {
		[void](Edit-JsonFile $vscodeSettings {
				param($v)
				$patterns = $v.'explorer.fileNesting.patterns'
				if ($patterns -and ($patterns.PSObject.Properties.Name -contains 'INIT.ps1')) {
					$patterns.PSObject.Properties.Remove('INIT.ps1')
				}
			})
	}
	Complete-Journal
	foreach ($s in @('INIT.lib.ps1', 'INIT.ps1')) {
		Remove-Item (Join-Path $root $s) -Force -ErrorAction SilentlyContinue
	}
	Write-Info 'Scripts de inicialización eliminados.'
} elseif ($KeepScripts) {
	Complete-Journal -Keep
}

# ── done ───────────────────────────────────────────────────────────────────

Write-Banner 'PROYECTO CONFIGURADO' ok
Write-Ui "  $appTitleFormatted" 'Green'
Write-Host ''
Write-Ui '  Próximos pasos:' 'Yellow'
Write-Next 'pnpm install'
Write-Next 'configurar secretos en env/dev.local.env.json'
Write-Next 'pnpm test:dev --coverage --run'
Write-Next 'pnpm start:dev   ·   http://localhost:4004/api'
Write-Host ''
