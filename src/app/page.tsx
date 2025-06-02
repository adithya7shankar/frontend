export default function Home() {
  return (
    <div>
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to NewsReflect
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          A place for thoughtful discussion and reflection on news from around the world.
        </p>
        <a
          href="/submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          Share Your Commentary
        </a>
      </section>

      <section className="py-10">
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">Trending Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder for Topic Cards */}
          {['AI Ethics', 'Climate Solutions', 'Future of Work'].map((topic) => (
            <div key={topic} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
              <h3 className="text-xl font-semibold text-blue-600 mb-2">{topic}</h3>
              <p className="text-gray-600 text-sm">
                Explore commentaries and discussions related to {topic.toLowerCase()}.
              </p>
              <a href="#" className="text-blue-500 hover:underline mt-4 inline-block">
                View Topic &rarr;
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10">
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">Recent Commentaries</h2>
        {/* Placeholder for Commentary List/Cards */}
        <div className="space-y-6">
          {[
            { title: 'The Impact of AI on Creative Industries', author: 'Alice Reflector', topic: 'AI Ethics' },
            { title: 'Renewable Energy: A Path to Sustainability', author: 'Bob Thinker', topic: 'Climate Solutions' },
            { title: 'Navigating the Gig Economy', author: 'Charlie Savant', topic: 'Future of Work' },
          ].map((commentary) => (
            <div key={commentary.title} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-1">{commentary.title}</h3>
              <p className="text-sm text-gray-500 mb-2">
                By <span className="font-medium">{commentary.author}</span> in <span className="text-blue-600">{commentary.topic}</span>
              </p>
              <p className="text-gray-700 line-clamp-3">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...
              </p>
              <a href="#" className="text-blue-500 hover:underline mt-4 inline-block">
                Read More &rarr;
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
