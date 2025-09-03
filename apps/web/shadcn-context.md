# ShadCN Components Used

This file tracks all ShadCN components used in the project to avoid reinstalling components that are already available.

## Currently Used Components

- **ShadCN/UI Components**:
  - Button (from shadcn/ui)
  - Input (from shadcn/ui)
  - Label (from shadcn/ui)
  - Breadcrumb (from shadcn/ui)
  - Separator (from shadcn/ui)
  - Card, CardContent, CardDescription, CardHeader, CardTitle (from shadcn/ui)
  - Avatar, AvatarFallback, AvatarImage (from shadcn/ui)
  - Badge (from shadcn/ui)
  - Tabs, TabsList, TabsTrigger, TabsContent (animate-ui Tabs)
  - Dialog (for modals)
  - Dropdown Menu (for menus)
  - Switch (for toggles)
  - Select (for dropdowns)
  - Separator (for layout)

- **Animate-UI Components**:
  - SidebarProvider, SidebarInset, SidebarTrigger (from animate-ui/radix/sidebar)
  - MotionEffect (from animate-ui/effects/motion-effect)
  - Progress (from animate-ui/radix/progress)
  - Dialog (from animate-ui/radix/dialog)
  - Dropdown Menu (from animate-ui/radix/dropdown-menu)
  - Collapsible (from animate-ui/radix/collapsible)
  - Tabs (from animate-ui/components/tabs)
  - Tooltip (from animate-ui/components/tooltip)

- **Custom Components Built**:
  - GI Randomizer (self-contained minigame UI for Genshin Impact)
  - AppSidebar (custom implementation)
  - LoginForm (custom implementation with shadcn/ui components)
  - Magic Link Authentication System (custom implementation)
  - Session Management System (custom implementation)
  - PFQApiKeyCard (custom implementation for PokéFarm Q API key management)
  - ProfileInformationCard (custom implementation for profile management)
  - AvatarCard (custom implementation for avatar management)
  - GameUIDsCard (custom implementation for game UID management)
  - BadgesCard (custom implementation for viewing and featuring badges)
  - SupportForm (custom support request form)
  - SupporterCard (custom VIP supporter form and CTA)
  - SupporterProgressCard (custom cumulative donations & giveaways progress)
  - AdminToolsCard (admin dashboard card listing tools)
  - FriendsListCard (friends list with mutual badges)
  - FriendsRequestsCard (tabs for received/sent/blocked requests)
  - FriendsManagementBar (pagination-only variant of management bar)
  - WwGroupsTable (admin WW grouping management)
  - InventoryDialog (WW planner inventory management)
  - ReorderPlansDialog (WW planner reorder UI)
  - PFQMarketboardSearch (PFQ item search with debounced input)
  - PFQMarketboardItem (PFQ item details with charts)

- **Custom Hooks Built**:
  - useGiData (GI data fetch + local caching + persistence)
  - useGiRandomizer (GI randomization and rules logic)
  - useGiLobby (GI multiplayer lobby lifecycle and rolling)
  - useAccount (account management and session handling)
  - usePFQApiKey (PFQ API key management)
  - useProfileInformation (profile information management)
  - useAvatar (avatar management and upload)
  - useGameUIDs (game UID management for Hoyoverse games)
  - useBadges (badge ownership and featured slots management)
  - useNavMain (main navigation menu data)
  - useNavLinks (external links navigation data)
  - useNavSecondary (secondary navigation menu data)
  - useSupport (support form state and submission)
  - useVIPSupport (VIP supporter details state and submission)
  - useSupporterProgress (VIP donations progress state)
  - useAdminTools (admin tool metadata & navigation)
  - useFriends (friends and friend-requests state management)
  - useFriendRealtime (websocket client for pending friend request count)
  - useWwAdminGroups (admin WW grouping state and actions)
  - useWwInventory (WW inventory state & localStorage persistence)
  - useMarketboardSearch (PFQ marketboard search state)
  - useMarketboardItem (PFQ marketboard item state)

## Installation History

- Project initialized with basic ShadCN setup
- Using Lucide React icons for all iconography
- Animate-UI components integrated for enhanced UX
- Magic link authentication system implemented with custom components
- Session management with secure cookies and database storage

## Notes

- Always check this file before installing new ShadCN components
- Update this file when adding new components
- Reference the ShadCN registry for available components
- Use animate-ui where possible for enhanced animations and effects
- Current approach: Mix of shadcn/ui components and custom implementations
- Magic link system uses existing UI components (Button, Input, Label) from shadcn/ui
- Animate-UI provides advanced animation and interaction components
- Toast styling centralized in `apps/web/lib/toast-styles.ts` with `toastStyles` utility for consistent sonner notifications
- Gravatar integration for automatic avatar import from user's email address
- Username validation with profanity filtering using bad-words-next library (server-side validation)
- Recent avatars system with file modification time tracking (keeps last 10 avatars, auto-cleanup on upload/import)
- PokéFarm Q API integration with secure API key storage and validation
- PFQ API service with centralized API calls and error handling
- Game UID management system for Hoyoverse games (Genshin Impact, Honkai: Star Rail, Zenless Zone Zero, Wuthering Waves)
- Discord webhook service for user activity notifications (avatar uploads, imports, username changes)
- Global user context for real-time avatar updates across components

## Potential Future ShadCN Components

- Dialog (for modals)
- Dropdown Menu (for advanced navigation)
- Switch (for toggles)
- Select (for dropdowns)
- Card (for dashboard layouts)
- Badge (for status indicators)
- Toast (for notifications - though using sonner currently)
- Tabs (for content organization)
- Accordion (for collapsible content)
