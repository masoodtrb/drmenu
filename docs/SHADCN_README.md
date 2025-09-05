# shadcn/ui Integration

This project has been successfully integrated with shadcn/ui and Tailwind CSS v4.

## What's Been Added

### Dependencies

- `@radix-ui/react-slot` - For component composition
- `class-variance-authority` - For component variants
- `clsx` - For conditional classes
- `tailwind-merge` - For merging Tailwind classes
- `lucide-react` - For icons
- `tailwindcss-animate` - For animations

### Configuration Files

- `tailwind.config.ts` - Extended with shadcn/ui design tokens
- `src/lib/utils.ts` - Utility functions including `cn()` for class merging
- `src/app/globals.css` - Updated with shadcn/ui CSS variables and design tokens

### Components

- `src/components/ui/button.tsx` - Button component with variants
- `src/components/ui/card.tsx` - Card component with header, content, footer
- `src/components/ui/input.tsx` - Input component
- `src/components/ui/example-usage.tsx` - Example showing how to use the components

## Usage

### Basic Button Usage

```tsx
import { Button } from "@/components/ui/button"

<Button>Click me</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
```

### Card Usage

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>;
```

### Input Usage

```tsx
import { Input } from '@/components/ui/input';

<Input type="email" placeholder="Enter your email" />;
```

## Design System

The project now includes a complete design system with:

- **Colors**: Primary, secondary, muted, accent, destructive variants
- **Typography**: Consistent text styles and spacing
- **Spacing**: Consistent spacing scale
- **Border Radius**: Standardized border radius values
- **Shadows**: Consistent shadow system
- **Dark Mode**: Full dark mode support

## Adding More Components

To add more shadcn/ui components:

1. Visit [shadcn/ui](https://ui.shadcn.com/docs/components)
2. Copy the component code
3. Place it in `src/components/ui/`
4. Import and use in your components

## Customization

You can customize the design system by:

1. Modifying CSS variables in `src/app/globals.css`
2. Updating the Tailwind config in `tailwind.config.ts`
3. Creating custom variants using `class-variance-authority`

## Example

Check out `src/components/ui/example-usage.tsx` to see a working example of all the components in action.
