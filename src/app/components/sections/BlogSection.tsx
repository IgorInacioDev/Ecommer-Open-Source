import Image from "next/image";

interface BlogSectionType {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
}

const blogSections: BlogSectionType[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Blog da Lure Secret',
    date: '26 de junho de 2025',
    imageUrl: '/banners/blog/baner_blog.jpeg',
  },
  {
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    title: 'Blog da Lure Secret', 
    date: '26 de junho de 2025',
    imageUrl: '/banners/blog/baner_blog.jpg',
  },
  {
    id: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    title: 'Blog da Lure Secret',
    date: '26 de junho de 2025',
    imageUrl: '/banners/blog/baner_blog.webp',
  }
]

const BlogSection = () => {
  return (
    <div className="w-full flex flex-col font-syne">
      <div className="mx-auto p-12 sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-9/12">
        <div className="text-center mb-16">
          <h1 className="text-2xl text-[#333333] mb-6 font-bold">Blog da Lure Secret</h1>
          <span className="text-[#333333] text-xs tracking-[0.3em] border border-zinc-200 py-2 px-4">VER TUDO</span>
        </div>

        <div className="grid grid-cols-1 lg:flex lg:flex-grid  gap-6">
          {blogSections.map((product) => (
            <div key={product.id} className="w-full h-full">
              <Image
                src={product.imageUrl}
                alt={product.title}
                width={800}
                height={800}
                className="object-cover"
              />
              <div className="mt-6">
                <span className="text-xs">{product.date}</span>
                <h1 className="text-[#333333]">{product.title}</h1>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BlogSection