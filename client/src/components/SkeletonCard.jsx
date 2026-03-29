const SkeletonCard = () => (
  <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 dark:border-gray-700/40 animate-pulse shadow-sm">
    {/* Image placeholder with shimmer */}
    <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700/60 dark:to-gray-800" />
    <div className="p-5 space-y-3">
      {/* Source + date row */}
      <div className="flex justify-between items-center">
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700/60 rounded-full" />
        <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700/60 rounded-full" />
      </div>
      {/* Title lines */}
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700/60 rounded-lg" />
        <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700/60 rounded-lg" />
      </div>
      {/* Description lines */}
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-gray-100 dark:bg-gray-800/60 rounded" />
        <div className="h-3 w-5/6 bg-gray-100 dark:bg-gray-800/60 rounded" />
        <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-800/60 rounded" />
      </div>
      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        <div className="h-8 flex-1 bg-gray-200 dark:bg-gray-700/60 rounded-xl" />
        <div className="h-8 w-10 bg-gray-200 dark:bg-gray-700/60 rounded-xl" />
        <div className="h-8 w-10 bg-gray-200 dark:bg-gray-700/60 rounded-xl" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;