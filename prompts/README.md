# Tutor Prompt Files (MVT)

## Current State
- C2 complete: Session layout + tutor-only whiteboard UI
- C3 defined: Tutor decision rules for when/how to use the whiteboard

## Next Implementation Steps
1) Wire the tutor system to consume `c3_whiteboard_system_prompt.txt`
2) Implement paced writing (step-by-step delays)
3) Connect tutor output to whiteboard draw commands
4) Add session timing logic (countdown + end)
5) Gate advanced behavior behind subscription

Checkpoint commits:
- fb3ced9 (C2 UI)
- 2c4ce42 (C3 prompt)
