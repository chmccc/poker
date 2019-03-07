# React Texas Holdem Poker

This is a Poker game built in React mainly for me to experiment with game-related logic, AI, and WebSockets for multiplayer. It is an ongoing project and much remains to be done. You can view a recent (though likely not latest) version <a href="http://ec2-52-53-214-71.us-west-1.compute.amazonaws.com" target="_blank">here</a>.

## Core Engine Functionality

### Dealing

- set proper card distribution at each game stage ✔️
- rotating dealer & blinds

### Score checking

- test & build score object creator for 5-card hands ✔️
- test & build best score function for 7-card hands ✔️
- determine winners between hands ✔️
- determine winners based on kicker cards ✔️

### Player actions/betting

- able to fold ✔️
- skipping & not scoring a folded player ✔️
- able to check & call ✔️
- able to raise
- distribution of pot to winner(s) ✔️

## AI

### v0.1:

- raises, folds, and calls randomly, weighted toward calling ✔️
- does not fold if checking is possible ✔️

### v0.2:

- in 1st round only, makes calculated decision based on strength of hole cards

### v1 (MVP before multiplayer can be introduced):

- bets sensible amounts based solely on strength/potential of own cards

### v1.1:

- considers other players' cards

### v2:

- uses FSMs for varied play strategy
  - based on position (blind, dealer, etc)
  - based on performance (losing, winning, etc)
  - based on gambits (bluffing)

## Display and messaging

### Display

- show a tabletop with 4 positions and space for table cards ✔️
- should show a "next stage" button initially ✔️
- should highlight cards used in winning hand once round is over ✔️
- show controls at the bottom right ✔️
- show balance for all players ✔️
- show pot total ✔️

### Folding

- fold button in control panel ✔️
- game should continue until final stage until player folds ✔️
- players who've folded should have their cards "greyed out"

### Message window

- should report the winner of a hand ✔️
- should report when a hand was won by a high card ✔️

## Multiplayer

- TBD
