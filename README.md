# MultiTools - Your All-in-One Toolkit

A comprehensive collection of useful tools for developers, designers, and creators. Built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Persistent Sidebar Navigation** - Easy access to all tools
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark Mode Support** - Beautiful dark and light themes
- **Smooth Animations** - Hardware-accelerated transitions
- **Modular Architecture** - Clean separation of concerns

## 🛠️ Available Tools

- **Calculator** - Advanced calculator with scientific functions and history
- **Text Tools** - Text manipulation and formatting utilities
- **Color Tools** - Color picker and palette generator
- **Code Tools** - Code formatting and utilities
- **Data Tools** - Data processing and analysis
- **Charts** - Interactive charts and graphs
- **Settings** - Customize your experience

## 🏗️ Architecture

This project follows a clean, modular architecture with clear separation of concerns:

### Folder Structure

```
/app
  /[tool-name]          # Tool-specific pages
    page.tsx            # Only layout and component usage
  layout.tsx            # Root layout with sidebar
  page.tsx              # Home dashboard

/components
  /ui                   # Shared UI components
    Sidebar.tsx         # Persistent sidebar
  /tools                # Tool-specific components
    CalculatorWidget.tsx

/hooks                  # Custom React hooks
  useCalculator.ts

/lib                    # Utility functions
  calculatorUtils.ts

/services               # API and backend interaction
  api.ts

/styles                 # Global styles
  globals.css
```

### Architecture Principles

1. **Functional Separation**
   - No business logic in page files
   - All logic separated into hooks, utilities, and services
   - Pages only contain layout and component usage

2. **Component Organization**
   - Shared components in `/components/ui/`
   - Tool-specific components in `/components/tools/`
   - Clear naming conventions

3. **State Management**
   - Custom hooks for complex state logic
   - Lightweight and focused state management
   - No global state unless necessary

4. **Performance**
   - Hardware-accelerated animations
   - Optimized re-renders with useCallback
   - Responsive design with mobile-first approach

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Website
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
pnpm build
pnpm start
```

## 🎨 Styling

This project uses:
- **Tailwind CSS** for utility-first styling
- **Custom CSS** for global styles and animations
- **Hardware acceleration** for smooth transitions
- **Responsive design** with mobile-first approach

## 📱 Responsive Design

The sidebar and all tools are fully responsive:
- **Desktop**: Persistent sidebar with full navigation
- **Mobile**: Collapsible sidebar with overlay
- **Tablet**: Adaptive layout with optimized spacing

## 🔧 Development

### Adding New Tools

1. Create a new folder in `/app/[tool-name]/`
2. Add a `page.tsx` file with only layout and components
3. Create tool-specific components in `/components/tools/`
4. Add business logic to custom hooks in `/hooks/`
5. Add utility functions to `/lib/` if needed
6. Update the sidebar navigation in `/components/ui/Sidebar.tsx`

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use custom hooks for complex logic
- Keep components focused and single-purpose
- Use meaningful variable and function names

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the architecture guidelines
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Inspired by modern web application design patterns
