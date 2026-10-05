const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Update = require('../models/Update');

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping automatic seeding.');
      return;
    }

    console.log('Seeding database with mock creators, campaigns, and donations...');

    // 1. Create Users
    const creatorUser = new User({
      name: 'Elena Rostova',
      email: 'creator@fundrise.com',
      password: 'password123', // Hashed in pre-save hook
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      bio: 'Industrial Designer & Publisher based in Copenhagen. Focused on tactile materials and sleek product engineering.',
      role: 'creator'
    });
    await creatorUser.save();

    const donorUser = new User({
      name: 'Mansoor Ahmed',
      email: 'donor@fundrise.com',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      bio: 'Technology enthusiast and startup backer. Passionate about green tech and tactile physical print.',
      role: 'donor'
    });
    await donorUser.save();

    const adminUser = new User({
      name: 'Platform Compliance',
      email: 'admin@fundrise.com',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      bio: 'FundRise compliance auditor team.',
      role: 'admin'
    });
    await adminUser.save();

    // 2. Create Campaigns
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
        status: 'funded', // status updated to funded since raised > goal
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
      }
    ];

    const seededCampaigns = [];
    for (const data of campaignsData) {
      // Create slugs
      const slug = data.title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
      const campaign = new Campaign({ ...data, slug });
      await campaign.save();
      seededCampaigns.push(campaign);
    }

    // 3. Create mock donations to populate backer lists
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
        donor: null, // Guest
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
      }
    ];

    for (const data of mockUpdates) {
      const up = new Update(data);
      await up.save();
    }

    console.log('✓ Seeding complete. Pre-populated mock campaigns, user sessions, and updates.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

module.exports = seedDatabase;
