/**
 * Reusable loading spinner component for survey pages
 */
export function SurveyLoadingSpinner() {
  return (
    <div className="absolute inset-0 bg-background flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
