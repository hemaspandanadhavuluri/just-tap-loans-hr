# Onboarding Form Enhancement: Integrate Accepted Offers into Full Name Field

## Completed Tasks
- [x] Modify PersonalInfo component in src/components/pages/OnboardingTraining.js:
  - [x] Convert "Full Name" TextField to conditional Select dropdown.
  - [x] Add "Manual Entry" option for manual input.
  - [x] Populate Select with acceptedOffers (candidate names).
  - [x] Update handleCandidateSelect to pre-fill email, dateOfBirth, and personalNumber on selection.
  - [x] Clear pre-filled fields when "Manual Entry" is selected.
  - [x] Remove separate "Select Accepted Offer Candidate" dropdown and its Grid item.

## Pending Tasks
- [ ] Test dropdown population: Verify acceptedOffers data loads correctly in the Full Name dropdown.
- [ ] Test selection and pre-filling: Select a candidate and confirm email, dateOfBirth, and personalNumber are pre-filled accurately.
- [ ] Test manual entry: Switch to "Manual Entry" and ensure fields clear and allow manual input.
- [ ] Test form validation: Ensure no regressions in required field checks and submission.
- [ ] Test full form flow: Navigate through all steps and submit to confirm no issues.
- [ ] Run app and backend: Start servers and perform end-to-end testing in browser.
