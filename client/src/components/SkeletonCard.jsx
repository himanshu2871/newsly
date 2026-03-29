const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse">
    <div className="w-full h-48 bg-gray-200 dark:bg-gray-800" />
    <div className="p-5 space-y-3">
      <div className="flex justify-between">
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="flex gap-2 pt-2">
        <div className="h-8 flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-8 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-8 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;