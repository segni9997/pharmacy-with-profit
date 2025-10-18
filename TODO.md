# TODO: Create Pharmacy Settings Page

## Steps to Complete

- [ ] Add Settings interface to src/lib/types.ts
- [ ] Create src/store/settingsApi.ts with GET and UPDATE endpoints
- [ ] Update src/store/store.ts to include settingsApi
- [ ] Create src/components/settings.tsx: Page with small card displaying settings and a button to open edit dialog
- [ ] Add /settings route in src/App.tsx
- [ ] Add settings link in src/components/dashboard.tsx navigation cards
- [ ] Implement fetch on page load and update functionality in settings.tsx
- [ ] Apply settings globally if needed (e.g., for low_stock_threshold usage)
- [ ] Test API integration and ensure settings persist and are used where applicable

## Followup Steps
- [ ] Test API integration
- [ ] Ensure settings persist and are used in medicine management (e.g., low_stock_threshold)
