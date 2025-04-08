export function ChatMessages({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto pb-[120px]">
      <div className="max-w-3xl mx-auto">
        {children}
      </div>
    </div>
  )
}
