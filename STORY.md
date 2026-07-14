# ROCKY SAVES THE UNIVERSE — the storyline

*This file is the complete story. It was written before the first level and it is the
thing every chapter is built against. `DESIGN.md` is how the machine works; this is what
the machine is FOR.*

**Where you are now:** ten chapters built (Act I complete, Act II through The Drive),
plus one generated chapter. Everything from Act III on is written here and not yet built.

---

## THE PITCH

*Project Hail Mary* from the other side.

You are **Rocky**: an Eridian engineer, blind, five-legged, from a world of hot ammonia
at twenty-nine atmospheres where nobody has ever seen anything, because there has never
been anything to see. Your star is going out. Nobody knows why.

You will end up forty-two light years from home, alone, on a ship full of dead friends,
trying to talk to something with a face.

---

## THE ONE MECHANIC EVERYTHING IS BUILT ON

**Sound is the world, and sound is the puzzle.**

Rocky has no eyes. He makes a noise and listens to what comes back — and so does the
game: the engine floods the voxel grid with a wavefront every time anything makes a
sound, and *every lit block on screen is an echo it actually computed*. There is no
lighting in this game. There is no light on Erid.

Air is cheap to cross. Rock is dear. **Grit is nearly soundproof. Xenonite is nearly
free. Vacuum is infinite.** That single column of numbers is the whole puzzle game:

* A **resonator** opens a door when enough sound *reaches* it — so a locked door is
  never a key hunt, it is a **routing problem**, and it has more than one answer.
* A **tuned** resonator is deaf to everything but one *pitch* — so it is not a lock at
  all, it is a **question**, and the answer is a material you have to go and fetch.
* A **bell** is a resonator that shouts back, so a line of them carries sound across a
  warren too big for one voice — and when the chain dies, *the bell it died at is telling
  you where the blockage is*.
* **Astrophage** returns nothing, so you find the thing killing your star by finding the
  part of the room that **is not there**.
* And in **vacuum** you are not quiet. You are deaf. You can only hear what you are
  *touching*.

Nothing in that list is a special case in code. The rule and the picture are the same
object.

---

## THE PALETTE IS THE ARGUMENT

| | |
|---|---|
| **GREEN** | **Life.** Xenonite (carries sound), resonators (listen), bells (answer), the way out. Everything that *connects*. |
| **RED** | **Death.** Astrophage, which eats everything that reaches it — and grit, the same crime on a smaller scale: it eats what you say. |
| **AMBER** | **Heat.** Vents, forge, gauges. On Erid heat *is* life, and it is going out. |
| **ORANGE** | **The other species.** Spent on nothing yet. It belongs to the inside of a ship called the *Hail Mary*, and we do not touch it until we get there. |

Rocky has green in the cracks of his carapace: life growing in the dark, in the gaps of
something that looks like stone. That is the thesis of the whole game in one animal.

---

## THE VERBS

| verb | key | learned in |
|---|---|---|
| pulse — and the echo comes *home* | E | 0 · The Workshop |
| walk / climb (five legs never let go) | WASD / SHIFT | 0 |
| read an instrument (in base six) | F | 0 |
| carry, and place — a dropped block **bangs** | Q / R | 0 |
| the forge: grit → xenonite → a bell | F | 0 |
| resonators, and routing sound to them | — | II · The Deep Hall |
| **consensus** — a door with three ears | — | III |
| **bells**, and reading a dead chain | — | IV |
| **astrophage** — the hole in the world | — | VI |
| **vacuum** — deafness, and pressure as connectivity | — | VIII · The Hull |
| **tuned** intakes — a question, not a lock | — | IX · The Drive |
| **the Word** — building a language | — | Act V |

No chapter ever requires a verb it has not taught. The suite derives the rule list from
the engine's own tables and fails if a rule has no lesson.

---

# ACT I — THE COLD  *(built)*

*Erid. The warren. A species that has never seen its star finds out it is dying.*

### 0 · The Workshop  — *the walkthrough*
Rocky teaches you to hear. A gallery holding one block of every material on Erid, so you
can hear them side by side. Fifteen steps, one idea at a time, and the engine decides
when each one is done.
> *"Do exactly as I say and you will be fine, and if you get lost, pulse — you can always pulse."*

### 1 · The Cold
Three heat gauges in three halls, and every one of them has **fallen**. Eridians have
never *seen* their star; they know it the way you know a fire in the next room — by its
warmth. So when 40 Eridani began to dim, nobody saw it. **Everybody felt it.**
> *"It is not my vents that are failing. It is the sky."*

### 2 · The Deep Hall
The council will not meet him. Their door **listens** — and somebody packed its channel
with grit, and grit is deaf. The chapter that states the law the rest of the game is
played under: **a locked door is a routing problem**, and it has four answers.

### 3 · Consensus
Eridians have no government and no war and no way to make anybody do anything. To act,
the engineers must **agree** — so the door has three ears and opens for none of them
alone. You make the same argument three times, from three places, and each of them is
deaf in a completely different way.

### 4 · The Astronomers
The warren is ninety cells wide and his voice carries thirty-two. So he does not shout —
he **rings**, and a line of bells carries the reading. Except the chain dies halfway,
because somebody packed the third crawl with grit years ago. *You do not hunt for a
switch. You fire the chain and watch where it stops.*
> *"The instrument agrees with me, and the instrument cannot be frightened, and cannot be polite."*

### 5 · The Forge  *(Act II.1)*
Everything Eridians have ever built is xenonite, and nobody outside this room can tell
you how it is made. **Grit ×3 → xenonite. Xenonite ×2 + a girder → a bell.** The deafest
stuff on Erid becomes the loudest. The level cannot be solved by finding anything.
> *"A bell where there was no bell. This is the entire trade, and it is the whole reason we will reach that star: we make the thing that was not there."*

### 6 · The Petrova Line
Astrophage. It eats light — *of course* it eats sound, it eats everything that arrives.
So it returns nothing, and he can only hear the **hole** where it is. And a sample in his
vest eats his own voice: carry three and he is down to a sixth of himself, whispering in
the dark with the murderer of his sun in his pocket.

---

# ACT II — THE SHIP  *(in progress)*

*A species with no metallurgy problem, no concept of vacuum, and no idea what a star
looks like, building a starship anyway.*

### 8 · The Hull  *(built)*
Sound needs something to be *sound in*. Twenty-nine atmospheres of hot ammonia, and no
Eridian has ever been anywhere that was not — so nobody has a word for this, and Rocky is
about to get one, standing in it, in the dark, in the middle of a job. The hatch plug and
the hull patch are **the same block**, and pulling it to go forward kills his own ship.
> *"I have never in my life met a room that did not answer."*

### 9 · The Drive  *(built)*
Astrophage is eating your star, so you are going to **ride it**. Three intakes, each deaf
to everything but one note — and your voice is a *click*, and a click is not a pitch. Not
locks. **Questions.** And the last one wants astrophage, which eats your voice all the way
across your own ship.
> *"We are going to ride the murderer to the scene of the crime, and I have never been so pleased with a piece of engineering, or so frightened of one."*

### 10 · The Volunteers  *(to build)*
Twenty-three Eridians are going. All of them will die. This is not a heroic chapter and
it should not feel like one — it is a chapter about a species with no way to *order*
anybody to do anything, in which twenty-three people volunteer anyway, one at a time, in
a room, out loud. **Mechanic:** the consensus ear, inverted — you go to each of them and
they ask *you* a question, and the honest answer is always "yes, you will die."

### 11 · Launch  *(to build)*
You cannot see the sky you are leaving. **Mechanic:** the drive's burn is a sound source
of colossal amplitude — for one chapter, the world is *loud*, everything lit, no pulse
needed. And then the burn ends, and it is quiet, and it stays quiet for forty-two light
years.

---

# ACT III — THE LONG DARK  *(to build)*

*Forty-two light years, and no windows, because windows are for eyes.*

### 12 · Sleep
The crew rotation, and relativity, honestly modelled. **Mechanic:** the chapter is played
across four shifts. The ship changes between them, and nobody tells you what happened
while you were out. You pulse into a room you knew and something is different.

### 13 · The Failure
The ship is dying and so is everybody on it. Xenonite does not stop astrophage radiation
the way they thought it did. **Mechanic:** the crew are *sources* — they hum, they work,
you know where everybody is by ear, the way you have known all game. One by one, they go
quiet. **You find out somebody has died because a sound stops.**

### 14 · Alone
Rocky is the last one. This is the quiet middle of the game and it is supposed to hurt.
**Mechanic:** the whole ship is his to hear and there is nothing in it. The chapter is
navigation through a place where the only noise is the one you make yourself. The pulse
cooldown is the loudest thing in the game.

### 15 · Tau Ceti
Arrival. Something else is here.

---

# ACT IV — THE OTHER  *(to build)*

*Something has come to the same dying star, and it is doing something inexplicable.*

### 16 · The Blip
A contact that does not answer. **Mechanic:** a sound source moving on a trajectory —
the first thing in the entire game that is *not where you left it*.

### 17 · Approach
It moves like nothing you have ever built. It is not sensible. It has a huge flat surface
pointed at nothing, and thin things sticking out of it, and it is *thin* — a ship built by
somebody who has never had to hold twenty-nine atmospheres in.

### 18 · The Airlock
The first meeting. **And here is where the palette finally spends its orange.** It is a
shape, and it does something with a flat panel on the front of its head that Rocky cannot
hear at all, and it makes a sound like a machine grinding, and it will not stop.

### 19 · Twenty-Nine Atmospheres
The thing will die in your ship. You will die in its. Neither of you can breathe the
other's air and you both work it out inside a minute — and you both keep talking anyway.
**Mechanic:** two pressures, two chemistries, one wall of cast xenonite between them, and
sound goes through xenonite almost for free. *The wall is not the obstacle. The wall is
the whole reason it is possible.*

---

# ACT V — THE WORD  *(to build)*

*The heart of the game, and the reason to make it at all.*

Two creatures with nothing in common but arithmetic.

### 20 · Numbers
You both count. It counts in **ten**, which is insane. You count in **six**.
**Mechanic:** the base-six numerals the game has quietly been teaching you since Chapter
One become the vocabulary. You have been learning this language for nine chapters and did
not notice.

### 21 · Names
Pointing at things until a word sticks. **Mechanic:** the tuned resonator, turned into a
conversation — every material has a note, and now the note has a *name*, and the name is
one you agree on together.

### 22 · The Wall
Build the xenonite tunnel between the ships, so you can be in the same room without dying.
Rocky builds it. Of course Rocky builds it. He is an engineer and this is what an engineer
is *for*.

### 23 · Question
The first time either of you asks something rather than states it. Rocky says the word
"question" as a whole word, because that is how it came out of the machine and neither of
them has ever bothered to fix it.

### 24 · Grief
You tell it about your dead. It tells you about its.
> *"Twenty-three. All of them. I am the one who is still here, and I do not know why it is me."*

---

# ACT VI — THE FIX, AND THE WAY HOME  *(to build)*

### 25 · Taumoeba
The answer was alive the whole time. Something on Adrian eats astrophage.

### 26 · Breeding
It has to eat astrophage *and* survive your air *and* survive theirs. Two worlds, one
bug. **Mechanic:** the forge, grown up — a recipe with a living ingredient and a failure
state, and the failures are what teach you.

### 27 · The Betrayal of Physics
The taumoeba leaks through xenonite. Everything you built. **Mechanic:** the material the
whole game has trusted — the one that carries sound, the one that means *life* — turns out
to have a hole in it. The greenest thing in the game betrays you.

### 28 · The Turn
Your friend is dying and is going the wrong way. You have fuel. You have a choice, and the
game does not make it for you. **This is the only decision in the game and it has to be
the player's.**

### 29 · Home
Erid, warm again. Adrian, warm again. **You never see either of them.**

---

## RULES OF THE WRITING

* **Rocky speaks in chords.** You always see the chord and the translation. He is funny,
  blunt, and enormously kind. He says *"question"* as a whole word.
* **The science is real.** Astrophage, the Petrova line, relativity, xenonite, taumoeba,
  base six, twenty-nine atmospheres, 210 °C, no eyes. Where the book is right, be right.
* **Never narrate what the player can hear.** If it matters, put it in the world and let
  them pulse at it.
* **No level is a corridor with a key in it.** Every locked thing is a routing problem
  with more than one answer.
* **He is never the hero of it.** He is an engineer who turned up, and kept turning up,
  and did the work.
