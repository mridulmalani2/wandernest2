import GuideSelection from '@/components/GuideSelection'

export default function MatchesPage({
  params
}: {
  params: { requestId: string }
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <GuideSelection
          requestId={params.requestId}
          onSelectionComplete={(selectedGuides) => {
            console.log('Selected guides:', selectedGuides)
            // Redirect or show confirmation
          }}
        />
      </div>
    </div>
  )
}
