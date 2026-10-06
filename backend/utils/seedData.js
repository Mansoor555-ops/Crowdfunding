const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Update = require('../models/Update');
const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');

const seedDatabase = async () => {
  try {
    const campaignCount = await Campaign.countDocuments();
    if (campaignCount > 0) {
      console.log('Database already has seeded campaigns. Skipping automatic seeding.');
      return;
    }

    console.log('Seeding database with authentic Indian creators, campaigns, comments, and donations in ₹ (INR)...');

    const getOrCreateUser = async (userData) => {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) return existingUser;

      const user = new User(userData);
      await user.save();
      return user;
    };

    // 1. Create or reuse Users
    const creatorUser = await getOrCreateUser({
      name: 'Ananya Sharma',
      email: 'creator@fundrise.com',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      bio: 'Craft Revivalist & Sustainable Designer based in Jaipur. Dedicated to empowering rural artisans through contemporary product design.',
      role: 'creator'
    });

    const donorUser = await getOrCreateUser({
      name: 'Mansoor Ahmed',
      email: 'donor@fundrise.com',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      bio: 'Tech enthusiast, independent backer, and advocate for sustainable grassroot innovations across India.',
      role: 'donor'
    });

    const adminUser = await getOrCreateUser({
      name: 'FundRise Compliance & Safety',
      email: 'admin@fundrise.com',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
      bio: 'Platform trust & verification lead.',
      role: 'admin'
    });

    // 2. Create 6 Authentic Indian Campaigns in ₹ (INR)
    const campaignsData = [
      {
        title: 'KalaNetra: Preserving Traditional Block Printing Artisans',
        description: 'KalaNetra is a grassroots initiative uniting 45 master craftspeople in Bagru, Rajasthan. We are creating a sustainable co-op facility equipped with eco-friendly natural dye extraction units, ergonomically designed carving tables, and direct global marketplace access.\n\nYour backing helps us construct water filtration systems that recycle 90% of dyeing water, keeping local rivers clean while preserving centuries-old block printing heritage for future generations.',
        category: 'Creative',
        fundingGoal: 250000,
        amountRaised: 185000,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        coverImage: 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&q=80&w=800',
        gallery: [
          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&q=80&w=800'
        ],
        status: 'active',
        creator: creatorUser._id,
        backersCount: 142,
        rewardTiers: [
          { title: 'Artisan Supporter', description: 'Handcrafted natural dye postcard set & digital backer wall mention.', minimumAmount: 500, estimatedDelivery: 'Nov 2026' },
          { title: 'Hand-loomed Stole', description: 'Authentic 100% organic cotton block printed stole handcrafted by Bagru artisans.', minimumAmount: 2500, estimatedDelivery: 'Dec 2026' }
        ]
      },
      {
        title: 'SunGrid Himalayas: Solar Power for Off-Grid Village Schools',
        description: 'Over 12 remote mountain schools in Spiti Valley face severe winter blackouts, stopping digital education for over 600 children. SunGrid Himalayas installs heavy-duty lithium-battery solar microgrids designed specifically for sub-zero Himalayan winters.\n\nWe provide reliable heating, LED lighting, and internet connectivity, ensuring uninterrupted learning even during heavy snowfall.',
        category: 'Community',
        fundingGoal: 500000,
        amountRaised: 520000,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        coverImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=800',
        gallery: [
          'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=800'
        ],
        status: 'funded',
        creator: creatorUser._id,
        backersCount: 210,
        rewardTiers: [
          { title: 'Solar Backer', description: 'Personalized thank you video from Himalayan students and digital certificate.', minimumAmount: 1000, estimatedDelivery: 'Oct 2026' }
        ]
      },
      {
        title: 'ChaiStray: Eco-Friendly Terracotta Cup Recycling Drive',
        description: 'Every day millions of single-use plastic cups clutter urban streets. ChaiStray manufactures 100% biodegradable clay kulhads using locally sourced red soil and bio-gas kilns.\n\nWe are deploying smart deposit-return kiosks across Bangalore tech parks where used clay cups are collected, crushed, and converted into nutrient-rich soil additives for urban gardens.',
        category: 'Environment',
        fundingGoal: 150000,
        amountRaised: 92000,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
        coverImage: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&q=80&w=800',
        gallery: [],
        status: 'active',
        creator: creatorUser._id,
        backersCount: 88,
        rewardTiers: [
          { title: 'Kulhad Starter Pack', description: 'Set of 6 handcrafted glazed tea kulhads delivered to your home.', minimumAmount: 1200, estimatedDelivery: 'Nov 2026' }
        ]
      },
      {
        title: 'IndicVerse: Open Source Mythological Indie RPG Game',
        description: 'IndicVerse is a story-driven action RPG inspired by ancient Indian folklore and epics, developed by an independent team of 6 game developers in Hyderabad.\n\nFeaturing hand-painted 3D environments, authentic classical Indian soundtracks played on Sitar & Tabla, and immersive combat mechanics. Funds will be used for full voice acting and motion capture recording.',
        category: 'Tech',
        fundingGoal: 350000,
        amountRaised: 215000,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
        coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
        gallery: [],
        status: 'active',
        creator: creatorUser._id,
        backersCount: 164,
        rewardTiers: [
          { title: 'Digital Game Key', description: 'Steam/PC Digital Download Key + Beta Access Pass.', minimumAmount: 899, estimatedDelivery: 'Jan 2027' }
        ]
      },
      {
        title: 'NadiRaksha: River Plastics Cleanup Patrol Boats',
        description: 'NadiRaksha builds solar-powered autonomous trash collector boats that intercept floating plastic waste in city rivers before it reaches the Arabian Sea and Bay of Bengal.\n\nEach boat captures up to 500kg of plastic daily using automated conveyor belts and solar batteries. Back us to deploy our first 3 patrol units on the Yamuna and Mula-Mutha rivers.',
        category: 'Charity',
        fundingGoal: 400000,
        amountRaised: 310000,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
        coverImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800',
        gallery: [],
        status: 'active',
        creator: creatorUser._id,
        backersCount: 195,
        rewardTiers: [
          { title: 'Clean River Guardian', description: 'Name engraved on Patrol Boat #01 hull + quarterly impact metrics report.', minimumAmount: 2000, estimatedDelivery: 'Dec 2026' }
        ]
      },
      {
        title: 'Vedas & Science: Interactive STEM Learning Kits',
        description: 'Hands-on experiential science experiment boxes for school kids combining modern physics & chemistry with historic Indian scientific discoveries—from zero to metallurgy.\n\nEvery kit includes safe lab materials, augmented reality (AR) cards, and step-by-step experiment workbooks translated into 5 regional languages.',
        category: 'Education',
        fundingGoal: 180000,
        amountRaised: 145000,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
        coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
        gallery: [],
        status: 'active',
        creator: creatorUser._id,
        backersCount: 110,
        rewardTiers: [
          { title: 'STEM Explorer Kit', description: 'Complete 15-experiment lab kit delivered to a school of your choice.', minimumAmount: 1500, estimatedDelivery: 'Nov 2026' }
        ]
      }
    ];

    const seededCampaigns = [];
    for (const data of campaignsData) {
      const slug = data.title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
      const campaign = new Campaign({ ...data, slug });
      await campaign.save();
      seededCampaigns.push(campaign);
    }

    // 3. Create mock donations in ₹ (INR)
    const mockDonations = [
      {
        amount: 2500,
        donor: donorUser._id,
        campaign: seededCampaigns[0]._id, // KalaNetra
        isAnonymous: false,
        status: 'succeeded',
        paymentIntentId: 'pi_mock_seed_1',
        receiptNumber: 'FR-IN-202610-1001',
        rewardTier: 'Hand-loomed Stole'
      },
      {
        amount: 500,
        donor: null,
        campaign: seededCampaigns[0]._id,
        isAnonymous: true,
        status: 'succeeded',
        paymentIntentId: 'pi_mock_seed_2',
        receiptNumber: 'FR-IN-202610-1002',
        rewardTier: 'Artisan Supporter'
      },
      {
        amount: 1000,
        donor: donorUser._id,
        campaign: seededCampaigns[1]._id, // SunGrid
        isAnonymous: false,
        status: 'succeeded',
        paymentIntentId: 'pi_mock_seed_3',
        receiptNumber: 'FR-IN-202610-1003',
        rewardTier: 'Solar Backer'
      }
    ];

    for (const data of mockDonations) {
      const don = new Donation(data);
      await don.save();
    }

    // 4. Create mock updates
    const mockUpdates = [
      {
        campaign: seededCampaigns[0]._id,
        title: 'Natural Dye Extraction Unit Installed in Bagru!',
        content: 'We are excited to share that our zero-chemical indigo & turmeric dye vats have been successfully set up in the artisan workshop. Water filtration testing begins next week!',
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800']
      },
      {
        campaign: seededCampaigns[1]._id,
        title: 'Solar Batteries Arrived in Spiti Valley',
        content: 'Despite early autumn rains, our team successfully transported the sub-zero lithium battery banks to Kaza village. Solar installation on School #01 is underway!',
        images: []
      }
    ];

    for (const data of mockUpdates) {
      const up = new Update(data);
      await up.save();
    }

    // 5. Create mock comments
    const mockComments = [
      {
        campaign: seededCampaigns[0]._id,
        user: donorUser._id,
        text: 'Wonderful initiative preserving traditional Rajasthani craft! Will backer updates include photos of the indigo dyeing process?'
      },
      {
        campaign: seededCampaigns[0]._id,
        user: creatorUser._id,
        text: 'Namaste Mansoor! Yes, we will post monthly photo journals directly from the Bagru workshops.'
      }
    ];

    for (const data of mockComments) {
      const comm = new Comment(data);
      await comm.save();
    }

    // 6. Create mock bookmarks
    const mockBookmark = new Bookmark({
      user: donorUser._id,
      campaign: seededCampaigns[0]._id
    });
    await mockBookmark.save();

    console.log('✓ Seeding complete. Pre-populated authentic Indian crowdfunding campaigns in ₹ (INR).');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

module.exports = seedDatabase;
