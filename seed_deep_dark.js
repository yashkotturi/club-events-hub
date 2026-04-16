const { createClient } = require("./node_modules/@supabase/supabase-js");

const supabaseUrl = 'https://yjtxqawjjhuymffopltw.supabase.co';
const supabaseAnonKey = 'sb_publishable_GDUhmlyT2Pqa9de6J10AUQ_z3W4KiVz';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CLUB_DETAILS = [
  {
    category: 'Innovation',
    description: 'We are a collective of futuristic thinkers building the next generation of decentralized applications and agentic workflows. Join us to reshape digital boundaries.',
    instagram_url: 'https://instagram.com/mitmanipal'
  },
  {
    category: 'Social',
    description: 'The premier network for organizing top-tier events, connecting leaders, and establishing a vibrant campus culture. Excellence in every interaction.',
    instagram_url: 'https://instagram.com/mit_social'
  },
  {
    category: 'Technical',
    description: 'Engineers, developers, and architects forging new software paradigms. We host hackathons, intensive bootcamps, and technical immersions.',
    instagram_url: 'https://instagram.com/mit_tech'
  },
  {
    category: 'Creative',
    description: 'A sanctuary for artists, designers, and visionaries. Exploring the intersection of digital media, classical art styles, and modern aesthetics.',
    instagram_url: null
  }
];

const EVENT_TEMPLATES = [
  {
    title: 'Architects Series: Deep Dive',
    description: 'An intensive session covering advanced architectural patterns in modern systems. High attendance expected. Bring your best questions for the panel.',
    location: 'Innovation Center, Sector 4',
    category: 'Workshop',
    capacity: 200,
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop'
  },
  {
    title: 'Neon Nights Mixer',
    description: 'Our flagship social protocol. Connect with peers from across different sectors in an elite, ambient environment. External handshake required.',
    location: 'Student Plaza',
    category: 'Social',
    capacity: 500,
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop'
  },
  {
    title: 'CodeRed Hackathon',
    description: 'A 24-hour sprint to build the next paradigm-shifting application. Food, servers, and caffeine provided. Compete for the grand prize.',
    location: 'Library AC Hall',
    category: 'Competition',
    capacity: 120,
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop'
  }
];

async function seedDatabase() {
  console.log('--- ENRICHING DATABASE ---');
  
  // 1. Fetch Clubs
  const { data: clubs, error: clubsError } = await supabase.from('clubs').select('*');
  if (clubsError) return console.error(clubsError);
  
  // 2. Update Clubs with rich details
  for (let i = 0; i < clubs.length; i++) {
    const club = clubs[i];
    const detail = CLUB_DETAILS[i % CLUB_DETAILS.length]; // cycle through templates
    
    // Identicon logo fallback explicitly defined for consistency
    const logoUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(club.name)}`;
    
    await supabase.from('clubs').update({
      description: detail.description,
      category: detail.category,
      instagram_url: detail.instagram_url,
      logo_url: logoUrl,
      is_verified: i % 3 === 0 // every third club is verified
    }).eq('id', club.id);
    
    console.log(`✓ Updated details for ${club.name}`);
    
    // 3. Insert Events for this club
    const template = EVENT_TEMPLATES[i % EVENT_TEMPLATES.length];
    
    // Generate a date in the near future
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 14) + 1);
    eventDate.setHours(18, 0, 0, 0); // 6 PM
    
    await supabase.from('events').insert({
      club_id: club.id,
      title: `${club.name}: ${template.title}`,
      description: template.description,
      date_time: eventDate.toISOString(),
      location: template.location,
      category: template.category,
      capacity: template.capacity,
      image_url: template.image_url,
      registration_link: 'https://forms.gle/nK2qvLbHJ599WTU56'
    });
    
    console.log(`  ↳ Created event for ${club.name}`);
  }
  
  console.log('--- REGISTRATION SEEDING COMPLETE ---');
}

seedDatabase();
