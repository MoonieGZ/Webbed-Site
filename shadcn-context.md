# ShadCN Components Used

This file tracks all ShadCN components used in the project to avoid reinstalling components that are already available.

## Currently Used Components

- **ShadCN/UI Components**: 
  - Button (from shadcn/ui)
  - Input (from shadcn/ui)
  - Label (from shadcn/ui)
  - Breadcrumb (from shadcn/ui)
  - Separator (from shadcn/ui)

- **Animate-UI Components**:
  - SidebarProvider, SidebarInset, SidebarTrigger (from animate-ui/radix/sidebar)
  - MotionEffect (from animate-ui/effects/motion-effect)

- **Custom Components Built**: 
  - AppSidebar (custom implementation)
  - LoginForm (custom implementation with shadcn/ui components)
  - Magic Link Authentication System (custom implementation)
  - Session Management System (custom implementation)

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