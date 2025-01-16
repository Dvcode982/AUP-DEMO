import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function FloatingActionButton() {
  return (
    <Link href="/create-post" className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-colors duration-200">
      <Plus size={24} />
    </Link>
  )
}

