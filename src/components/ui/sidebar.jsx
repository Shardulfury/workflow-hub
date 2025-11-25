import * as React from "react"
import { cn } from "@/utils"
import { Slot } from "@radix-ui/react-slot"

const SidebarContext = React.createContext({})

export function SidebarProvider({ children }) {
    return <SidebarContext.Provider value={{}}>{children}</SidebarContext.Provider>
}

export const Sidebar = React.forwardRef(({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col h-full w-64", className)} {...props}>
        {children}
    </div>
))
Sidebar.displayName = "Sidebar"

export const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
))
SidebarHeader.displayName = "SidebarHeader"

export const SidebarContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-auto", className)} {...props} />
))
SidebarContent.displayName = "SidebarContent"

export const SidebarGroup = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
))
SidebarGroup.displayName = "SidebarGroup"

export const SidebarGroupContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

export const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("space-y-1", className)} {...props} />
))
SidebarMenu.displayName = "SidebarMenu"

export const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

export const SidebarMenuButton = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp ref={ref} className={cn("w-full text-left", className)} {...props} />
})
SidebarMenuButton.displayName = "SidebarMenuButton"

export const SidebarFooter = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
))
SidebarFooter.displayName = "SidebarFooter"

export const SidebarTrigger = React.forwardRef(({ className, ...props }, ref) => (
    <button ref={ref} className={cn("", className)} {...props}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M9 3v18" /></svg>
    </button>
))
SidebarTrigger.displayName = "SidebarTrigger"
