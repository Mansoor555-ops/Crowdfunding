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

    console.log('Seeding database with mock creators, campaigns, comments, and donations...');

    const getOrCreateUser = async (userData) => {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) return existingUser;

      const user = new User(userData);
      await user.save();
      return user;
    };

    // 1. Create or reuse Users
    const creatorUser = await getOrCreateUser({
      name: 'Elena Rostova',
      email: 'creator@fundrise.com',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      bio: 'Industrial Designer & Publisher based in Copenhagen. Focused on tactile materials and sleek product engineering.',
      role: 'creator'
    });

    const donorUser = await getOrCreateUser({
      name: 'Mansoor Ahmed',
      email: 'donor@fundrise.com',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      bio: 'Technology enthusiast and startup backer. Passionate about green tech and tactile physical print.',
      role: 'donor'
    });

    const adminUser = await getOrCreateUser({
      name: 'Platform Compliance',
      email: 'admin@fundrise.com',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      bio: 'FundRise compliance auditor team.',
      role: 'admin'
    });

    // 2. Create 6 Rich Campaigns
    const campaignsData = [
      {
        title: 'Orbital Key: The Zero-Gravity EDC Carabiner',
        description: 'Orbital Key is a premium grade 5 titanium carabiner designed with magnetic centering rails. Engineered for everyday carry (EDC) enthusiasts who demand clean mechanics, zero-gravity tactile spring gates, and sleek structural shapes.\n\nEvery carabiner is bead-blasted to a matte velvet texture, weighing only 18 grams while supporting up to 150 lbs of static load. We are seeking funds for precision CNC tooling and manufacturing.',
        category: 'Tech',
        fundingGoal: 25000,
        amountRaised: 18450,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
        coverImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
        gallery: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800'
        ],
        status: 'active',
        creator: creatorUser._id,
        backersCount: 142
      },
      {
        title: 'Linen & Ink: A Minimalist Editorial Magazine',
        description: 'Linen & Ink is an independent biannual print publication exploring slow architecture, tactile pottery, and underground editorial typography.\n\nPrinted on 120gsm FSC-certified uncoated linen paper with flat-lay binding, every issue is a collectible design object designed to slow down your visual consumption. Issue 01 features in-depth interviews with minimalist architects from Kyoto and ceramicists from Copenhagen.',
        category: 'Creative',
        fundingGoal: 8000,
        amountRaised: 9400,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
        coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
        gallery: [
          'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800'
        ],
        status: 'funded',
        creator: creatorUser._id,
        backersCount: 88
      },
      {
        title: 'The Clean Canopy: Urban Air Filter Installations',
        description: 'We are installing bio-engineered algae-based air filtration columns in high-traffic urban plazas. These canopies naturally consume carbon dioxide and release oxygen at a velocity equivalent to 200 mature street trees, helping clean local air.\n\nEvery Clean Canopy features integrated seating, public USB chargers, and fine particulate sensors broadcasting local air quality indexes in real-time. Funds go towards fabrication materials and botanical assembly.',
        category: 'Community',
        fundingGoal: 45000,
        amountRaised: 12200,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28),
        coverImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800',
        gallery: [
          'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800'
        ],
        status: 'active',
        creator: creatorUser._id,
        backersCount: 95
      },
      {
        title: 'EmpowerEd: Digital Literacy Kits for Kids',
        description: 'EmpowerEd distributes portable computer kits and digital literacy curriculums to kids in rural areas. Our kits are built around low-cost single board computers, containing offline coding modules, typing games, and design tutorials.\n\nWe provide solar power banks to ensure operations in areas with intermittent grid access, enabling classrooms to explore technology skills safely.',
        category: 'Education',
        fundingGoal: 15000,
        amountRaised: 4200,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
        coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
        gallery: [],
        status: 'active',
        creator: creatorUser._id,
        backersCount: 32
      },
      {
        title: 'Resilient Reefs: Marine Sanctuary Restoration',
        description: 'An ocean conservation initiative planting heat-tolerant coral nurseries across damaged barrier reefs. Our team of marine biologists uses 3D-printed ceramic reef structures to accelerate coral attachment by 300%.\n\nJoin our community of ocean backers and receive monthly underwater camera updates monitoring coral growth in real-time.',
        category: 'Charity',
        fundingGoal: 30000,
        amountRaised: 22100,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 22),
        coverImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800',
        gallery: [
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'
        ],
        status: 'active',
        creator: creatorUser._id,
        backersCount: 164
      },
      {
        title: 'Acoustic Minimal: Solid Walnut Desktop Speakers',
        description: 'Handcrafted active studio monitors sculpted from solid American walnut and brushed brass. Featuring audiophile custom silk dome tweeters and passive bass radiators tuned for warm, room-filling soundscapes.\n\nDesigned for minimalist workspaces, each pair comes individually numbered with a certificate of acoustic tuning.',
        category: 'Tech',
        fundingGoal: 20000,
        amountRaised: 15800,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        coverImage: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800',
        gallery: [],
        status: 'active',
        creator: creatorUser._id,
        backersCount: 110
      }
    ];

    const seededCampaigns = [];
    for (const data of campaignsData) {
      const slug = data.title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
      const existingCampaign = await Campaign.findOne({ title: data.title });
      const campaign = existingCampaign || new Campaign({ ...data, slug });
      if (!existingCampaign) {
        await campaign.save();
      }
      seededCampaigns.push(campaign);
    }

    // 3. Create mock donations
    const mockDonations = [
      {
        amount: 250,
        donor: donorUser._id,
        campaign: seededCampaigns[0]._id, // Orbital Key
        isAnonymous: false,
        status: 'succeeded',
        paymentIntentId: 'pi_mock_seed_1',
        rewardTier: 'Gold Backer'
      },
      {
        amount: 50,
        donor: null,
        campaign: seededCampaigns[0]._id,
        isAnonymous: true,
        status: 'succeeded',
        paymentIntentId: 'pi_mock_seed_2',
        rewardTier: 'Standard Backer'
      },
      {
        amount: 100,
        donor: donorUser._id,
        campaign: seededCampaigns[1]._id, // Linen & Ink
        isAnonymous: false,
        status: 'succeeded',
        paymentIntentId: 'pi_mock_seed_3',
        rewardTier: 'Silver Backer'
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
        title: 'CNC Precision Prototype Verified!',
        content: 'We received our first Grade 5 Titanium precision CNC prototype from our manufacturing partner today. The magnetic gates lock with extreme centering alignment. Visual tolerances are pristine. Next up is load testing!',
        images: ['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800']
      },
      {
        campaign: seededCampaigns[1]._id,
        title: 'Linen Paper Proofs Approved',
        content: 'The 120gsm FSC-certified uncoated linen paper proofs just arrived from our press in Copenhagen. The ink saturation and tactile tooth feel incredible!',
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
        text: 'The titanium finish looks incredible! Does it include a key ring attachment loop?'
      },
      {
        campaign: seededCampaigns[0]._id,
        user: creatorUser._id,
        text: 'Yes! The top loop is precision milled to fit standard split rings up to 3.5mm thick.'
      },
      {
        campaign: seededCampaigns[1]._id,
        user: donorUser._id,
        text: 'Super excited for Issue 01! Will international shipping include tracking?'
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

    console.log('✓ Seeding complete. Pre-populated mock campaigns, updates, comments, and bookmarks.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

module.exports = seedDatabase;
