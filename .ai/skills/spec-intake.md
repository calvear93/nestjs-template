# Skill: Spec — Intake

Help **anyone** — technical or not — turn a rough idea into a clear, **detailed** brief that
`/spec-propose` can consume. **A guided interview, not a form.** This is the optional on-ramp to
the spec loop: its job is to produce a complete, well-structured input so the proposal that
follows isn't built on gaps.

## When to use

Whenever an idea is rough, vague, or one-line and needs shaping into a detailed input — no
matter the requester's background. Input: a rough idea ("quiero que…"). Output: an idea brief.

## Principles

- **Meet them at their level.** Adapt vocabulary and depth to the person: plain language by
  default, more precise and technical when they're comfortable with it. Don't force jargon on
  someone who doesn't want it, and don't oversimplify for someone who's being specific. Write
  the brief in the user's language so they can confirm it.
- **Ask what, not how.** Capture the problem and the desired outcome. If the person volunteers
  technical ideas or constraints, capture them as **notes for `/spec-design`** rather than
  baking a solution into the requirements.
- **Drive toward detail.** The goal is a _detailed_ brief — probe vague answers, surface edge
  cases, and pin down success criteria. "It should just work" is a prompt for more questions,
  not an answer.
- **One small step at a time.** Ask 1–3 questions per turn, building on each answer instead of
  running a fixed script.
- **Make it concrete.** Draw out a real example or short story ("cuéntame la última vez que…")
  and reflect each answer back in the user's own words to confirm.
- **Offer choices when they're stuck.** Give guided options (e.g. via the AskUserQuestion tool)
  so they can pick rather than invent from a blank page.
- **Never invent.** If something is unknown, record it as an open question — don't fill the gap
  with an assumption.

## Procedure

1. **Set the scene.** One sentence calibrated to the person, e.g. "Te haré algunas preguntas
   para dejar la idea bien definida antes de formalizarla." Read `specs/project.md` first so you
   frame questions in the product's real context.
2. **Draw out the essentials** — cover these, adapting order and depth to the conversation (each
   maps to part of the future `proposal.md`):
    - **The problem (why):** What's missing or frustrating today? Who does it affect, how often,
      and what does it cost when it goes wrong?
    - **Who uses it:** Who would do this — a person, another system, an end customer?
    - **What should happen (the ideal case):** Walk me through, step by step, how it should work
      on a good day.
    - **Rules and "what ifs":** What special cases exist? Ask "what should happen if…?" for the
      obvious ones (invalid data, duplicates, something missing, a limit reached).
    - **How we'll know it's done:** What would you need to see or be able to do to say "this
      works"? (These become the acceptance criteria — make them observable.)
    - **What's NOT included:** Anything people might expect that we want to leave out for now?
    - **Known limits & technical notes:** deadlines, other systems it must talk to, sensitive
      data, volumes — plus any solution ideas the user already has (kept as notes for design).
3. **Confirm understanding.** Summarize the whole idea back in the user's words. Fix anything
   wrong or thin before writing.
4. **Write the idea brief** from `.ai/templates/idea.template.md`: natural language, focused on
   the _what_ and _why_; technical ideas go under notes, not into the requirements. Put every
   unknown under **Open questions**.
5. **Hand off.** Explain in one line that the next step turns this into a formal change:
   `/spec-propose` reads the brief and produces the proposal + spec deltas. Offer to run it.

## Output

- A detailed idea brief (natural language, in the user's language) covering problem, users,
  desired flow, rules, success, scope, constraints, and open questions — ready to feed
  `/spec-propose`.
- The list of open questions still to resolve.
- **Next step:** `/spec-propose` (pass it the brief).
