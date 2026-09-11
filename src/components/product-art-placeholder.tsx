import { VialsTileArt, SyringesTileArt } from "./category-art"

export function ProductArtPlaceholder({
  title,
  className = "p-6",
}: {
  title: string
  className?: string
}) {
  const isSyringe = title.toLowerCase().includes("syringe")

  return (
    <div className={`flex h-full w-full items-center justify-center ${className}`}>
      {isSyringe ? (
        <SyringesTileArt className="h-full w-full" />
      ) : (
        <VialsTileArt className="h-full w-full" />
      )}
    </div>
  )
}
