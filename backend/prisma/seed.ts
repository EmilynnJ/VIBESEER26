import { PrismaClient, UserRole } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create sample readers
  const readers = [
    {
      email: "emilynn@soulseer.com",
      name: "Emilynn",
      role: UserRole.READER,
      displayName: "Emilynn",
      bio: "Founder of SoulSeer and gifted psychic medium with over 15 years of experience. I specialize in spiritual guidance, past life readings, and connecting with loved ones who have passed.",
      specialties: JSON.stringify([
        "Medium",
        "Past Life",
        "Spiritual Guidance",
        "Love & Relationships",
      ]),
      yearsExperience: 15,
      profileImage: "https://i.postimg.cc/s2ds9RtC/FOUNDER.jpg",
      isOnline: true,
      isAvailable: true,
      chatRatePerMin: 3.99,
      phoneRatePerMin: 4.99,
      videoRatePerMin: 5.99,
      rating: 4.9,
      totalReviews: 247,
      totalSessions: 1853,
    },
    {
      email: "crystal@soulseer.com",
      name: "Crystal Waters",
      role: UserRole.READER,
      displayName: "Crystal Waters",
      bio: "Intuitive tarot reader and energy healer. I help clients navigate life's challenges with compassion and clarity through the wisdom of the cards.",
      specialties: JSON.stringify([
        "Tarot",
        "Energy Healing",
        "Career Guidance",
        "Spiritual Growth",
      ]),
      yearsExperience: 8,
      profileImage: null,
      isOnline: false,
      isAvailable: false,
      chatRatePerMin: 2.99,
      phoneRatePerMin: 3.99,
      videoRatePerMin: 4.99,
      rating: 4.8,
      totalReviews: 156,
      totalSessions: 892,
    },
    {
      email: "luna@soulseer.com",
      name: "Luna Star",
      role: UserRole.READER,
      displayName: "Luna Star",
      bio: "Astrologer and clairvoyant with a deep connection to the cosmos. I offer birth chart readings, compatibility analysis, and divine guidance.",
      specialties: JSON.stringify([
        "Astrology",
        "Clairvoyant",
        "Love & Romance",
        "Life Path",
      ]),
      yearsExperience: 12,
      profileImage: null,
      isOnline: true,
      isAvailable: true,
      chatRatePerMin: 3.49,
      phoneRatePerMin: 4.49,
      videoRatePerMin: 5.49,
      rating: 4.7,
      totalReviews: 203,
      totalSessions: 1245,
    },
    {
      email: "sage@soulseer.com",
      name: "Sage Morgan",
      role: UserRole.READER,
      displayName: "Sage Morgan",
      bio: "Empathic reader specializing in dream interpretation and angel communication. I guide clients toward their highest purpose with love and light.",
      specialties: JSON.stringify([
        "Dream Interpretation",
        "Angel Messages",
        "Empathic Reading",
        "Life Purpose",
      ]),
      yearsExperience: 6,
      profileImage: null,
      isOnline: true,
      isAvailable: false,
      chatRatePerMin: 2.49,
      phoneRatePerMin: 3.49,
      videoRatePerMin: 4.49,
      rating: 4.9,
      totalReviews: 98,
      totalSessions: 534,
    },
    {
      email: "raven@soulseer.com",
      name: "Raven Moon",
      role: UserRole.READER,
      displayName: "Raven Moon",
      bio: "Third-generation psychic with gifts in palmistry, numerology, and oracle readings. I provide honest, compassionate guidance for all of life's questions.",
      specialties: JSON.stringify([
        "Palmistry",
        "Numerology",
        "Oracle Cards",
        "Family & Home",
      ]),
      yearsExperience: 20,
      profileImage: null,
      isOnline: false,
      isAvailable: false,
      chatRatePerMin: 4.49,
      phoneRatePerMin: 5.49,
      videoRatePerMin: 6.49,
      rating: 4.8,
      totalReviews: 312,
      totalSessions: 2104,
    },
  ];

  for (const readerData of readers) {
    const { displayName, bio, specialties, yearsExperience, profileImage, isOnline, isAvailable, chatRatePerMin, phoneRatePerMin, videoRatePerMin, rating, totalReviews, totalSessions, ...userData } = readerData;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!user) {
      // Create user
      user = await prisma.user.create({
        data: userData,
      });
      console.log(`✅ Created user: ${user.name}`);

      // Create reader profile
      await prisma.readerProfile.create({
        data: {
          userId: user.id,
          displayName,
          bio,
          specialties,
          yearsExperience,
          profileImage,
          isOnline,
          isAvailable,
          chatRatePerMin,
          phoneRatePerMin,
          videoRatePerMin,
          rating,
          totalReviews,
          totalSessions,
        },
      });
      console.log(`✅ Created reader profile: ${displayName}`);
    } else {
      console.log(`⏭️  User already exists: ${user.name}`);
    }
  }

  console.log("🌱 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
