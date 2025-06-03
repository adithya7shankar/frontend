import Button from '@/components/Button'; // Import the new Button component

export default function Home() {
  return (
    <div className="space-y-16"> {/* Increased spacing between sections */}
      <section className="text-center py-16"> {/* Increased padding */}
        <h1 className="text-5xl font-bold text-warm-text-primary mb-6"> {/* Larger, primary text color */}
          Welcome to NewsReflect
        </h1>
        <p className="text-xl text-warm-text-secondary mb-10 font-serif"> {/* Serif for descriptive text, larger */}
          A space for thoughtful discussion and reflection on news from around the world.
        </p>
        <Button href="/submit" size="lg" variant="primary">
          Share Your Reflection
        </Button>
      </section>

      <section className="py-12">
        <h2 className="text-4xl font-semibold text-warm-text-primary mb-8 text-center">Explore Perspectives by Topic</h2> {/* Centered, larger */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Increased gap */}
          {/* Placeholder for Topic Cards */}
          {['AI Ethics', 'Climate Solutions', 'Future of Work'].map((topic) => (
            <div key={topic} className="bg-warm-surface p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-warm-border-soft"> {/* Softer shadow, border, rounded-xl */}
              <h3 className="text-2xl font-semibold text-calm-blue-accent mb-3">{topic}</h3>
              <p className="text-warm-text-secondary text-md mb-4 font-serif"> {/* Serif for description */}
                Explore commentaries and discussions related to {topic.toLowerCase()}.
              </p>
              <a href="#" className="text-calm-blue-accent hover:text-calm-blue-accent-hover font-semibold transition-colors">
                View Topic &rarr;
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-4xl font-semibold text-warm-text-primary mb-8 text-center">Recent Reflections</h2> {/* Centered, larger */}
        {/* Placeholder for Commentary List/Cards */}
        <div className="space-y-8"> {/* Increased gap */}
          {[
            { title: 'The Impact of AI on Creative Industries', author: 'Alice Reflector', topic: 'AI Ethics' },
            { title: 'Renewable Energy: A Path to Sustainability', author: 'Bob Thinker', topic: 'Climate Solutions' },
            { title: 'Navigating the Gig Economy', author: 'Charlie Savant', topic: 'Future of Work' },
          ].map((commentary) => (
            <div key={commentary.title} className="bg-warm-surface p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-warm-border-soft"> {/* Softer shadow, border */}
              <h3 className="text-2xl font-semibold text-warm-text-primary mb-2">{commentary.title}</h3>
              <p className="text-md text-warm-text-secondary mb-3">
                By <span className="font-semibold text-calm-blue-accent">{commentary.author}</span> in <span className="font-semibold text-calm-blue-accent">{commentary.topic}</span>
              </p>
              <p className="text-warm-text-primary font-serif text-lg leading-relaxed line-clamp-4 mb-4"> {/* Serif for commentary, larger, more line height */}
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...
              </p>
              <a href="#" className="text-calm-blue-accent hover:text-calm-blue-accent-hover font-semibold transition-colors">
                Read Full Reflection &rarr;
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
