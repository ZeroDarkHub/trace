import * as React from "react"
import { cn } from "@/lib/utils"

const AlertDialogContext = React.createContext({})

const AlertDialog = ({ children, open, onOpenChange }) => {
  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

const AlertDialogTrigger = React.forwardRef(({ children, asChild, ...props }, ref) => {
  const { onOpenChange } = React.useContext(AlertDialogContext)
  
  const handleClick = () => {
    onOpenChange?.(true)
  }
  
  if (asChild) {
    return React.cloneElement(children, {
      ...props,
      ref,
      onClick: handleClick
    })
  }
  
  return (
    <button ref={ref} onClick={handleClick} {...props}>
      {children}
    </button>
  )
})

const AlertDialogContent = React.forwardRef(({ children, className, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(AlertDialogContext)
  
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange?.(false)}
      />
      <div 
        ref={ref}
        className={cn(
          "relative z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  )
})

const AlertDialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)

const AlertDialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))

const AlertDialogAction = React.forwardRef(({ className, onClick, ...props }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))

const AlertDialogCancel = React.forwardRef(({ className, onClick, ...props }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className={cn(
      "mt-2 inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:mt-0",
      className
    )}
    {...props}
  />
))

const AlertDialogPortal = ({ children }) => children
const AlertDialogOverlay = ({ children }) => children

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
