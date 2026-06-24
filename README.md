# Should I S-Corp?

Hey, Collective team.

## Why I built this

I came across the New Grad Software Engineer role and instead of just sending a resume, I wanted to show you how I think. So I built this demo app in one day (obviously with the express help of AI for speed). It's a functional S Corp tax savings calculator, designed specifically for the kind of people you serve every day - freelancers and solo entrepreneurs trying to figure out if structuring their business differently could actually put more money in their pocket.

## What it does

You type in your annual income, pick your state, and choose your filing status. The two sides of the screen update instantly - left shows your tax breakdown as a sole proprietor, right shows what that same income looks like structured as an S Corp. The difference between the two is the whole point: there's a callout that spells out exactly how much more (or less) you'd keep as an S Corp, plus a gentle heads-up when your income is low enough that the election probably isn't worth the overhead. Hover over any slice or line item to see the math behind it - the bracket you're in, your effective rate, the specific fees for your state. There's a "refine your estimate" section if you want to factor in business expenses too.

The state tax data is real - I researched and compiled current 2026 fee structures, franchise tax rules, and income tax brackets for all 50 states into a JSON that drives the calculations. No made-up numbers. That said, I'm a software engineer, not a tax professional - I did my best to vet and source the entries, but in an ideal world this data would be reviewed by a CPA before anyone made real decisions with it. The architecture makes that easy: it's one JSON file, one source of truth, fully decoupled from the logic layer.

## Why these technical choices

Every decision maps back to something in the job description or something I know matters at Collective.

**React + TypeScript** is the foundation. The role lists both. The calculator is fully reactive - no submit button, everything updates as you type.

**Tailwind CSS** for styling. No component library. Every layout decision is in the code.

**Vite** for the build. Fast, lightweight, no ceremony.

**Rough.js for the hand-drawn feel.** The whole thing is styled after Excalidraw - sketchy borders, a hand-drawn font, a dotted-paper background. A tax calculator is exactly the kind of thing that usually looks cold and intimidating, and I wanted this one to feel approachable instead. Rough.js is the one extra dependency I reached for, and only because that friendliness felt worth it.

**The math is isolated in its own pure utility modules** - completely separate from the UI, and written to be unit testable. I wanted the business logic to be readable and auditable on its own, because tax math that's tangled into components is a debugging nightmare.

**The state tax JSON** is its own artifact. I treated it as a data contract - the calculator degrades gracefully if a state entry is missing, so the data layer and the logic layer are decoupled.

## Honest notes

I'm a junior engineer, and this is a demo for you all - not a production tax tool. The math is based on real 2026 federal brackets and researched state data, but there are simplifying assumptions baked in (reasonable salary defaults to 50% of net profit, S Corp overhead is a flat $2,500/year). 

I also genuinely love what Collective is building. Before I switched careers into software, I was a ceramic artist - I was afraid some day some customer would break something and sue me over some injury (yes, I *am* an overthinker). I remember staring at tax forms and LLC paperwork feeling completely lost and constantly worried I was doing it wrong. Collective is fixing that, and I think that matters a lot. There are so many people running their own thing who are leaving real money on the table just because the system was never explained to them in plain English. This calculator is a small attempt at that.

If I had more time I'd swap the pie charts for the Sankey flow diagrams I originally wanted, add proper unit tests for the math utility, and handle the dozen states whose fees depend on net worth or gross revenue (looking at you, Texas and Delaware) with more precision - right now those gracefully fall back to each state's documented minimum instead of an exact figure.

Anyways, that's all.  thanks for your time!! 
-Helen

[Portfolio](https://heyimhelen.com) | [LinkedIn](https://www.linkedin.com/in/helen-highwater-96981532/)