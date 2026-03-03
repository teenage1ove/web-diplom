import { PrismaClient, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.message.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.aIRecommendation.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.nutritionPlan.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.fitnessGoal.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.trainer.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleared existing data');

  // Create users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-05-15'),
      gender: Gender.male,
      height: 180,
      weight: 80,
      emailVerified: true,
      isActive: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: new Date('1992-08-22'),
      gender: Gender.female,
      height: 165,
      weight: 60,
      emailVerified: true,
      isActive: true,
    },
  });

  const trainerUser = await prisma.user.create({
    data: {
      email: 'mike.trainer@example.com',
      passwordHash,
      firstName: 'Mike',
      lastName: 'Johnson',
      dateOfBirth: new Date('1985-03-10'),
      gender: Gender.male,
      height: 185,
      weight: 90,
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('✓ Created 3 users');

  // Create trainer
  const trainer = await prisma.trainer.create({
    data: {
      userId: trainerUser.id,
      specialization: ['strength', 'cardio', 'nutrition'],
      bio: 'Certified personal trainer with 10 years of experience. Specializing in strength training and nutrition coaching.',
      experienceYears: 10,
      certifications: ['NASM-CPT', 'ACE', 'Precision Nutrition Level 1'],
      hourlyRate: 50,
      rating: 4.8,
      totalReviews: 45,
      availability: {
        monday: ['09:00-12:00', '14:00-18:00'],
        wednesday: ['09:00-12:00', '14:00-18:00'],
        friday: ['09:00-12:00', '14:00-18:00'],
      },
      isVerified: true,
    },
  });

  console.log('✓ Created 1 trainer');

  // Create exercises
  const exercises = await Promise.all([
    prisma.exercise.create({
      data: {
        name: 'Bench Press',
        description: 'A compound exercise that primarily targets the chest muscles.',
        category: 'strength',
        muscleGroups: ['chest', 'shoulders', 'triceps'],
        equipment: ['barbell', 'bench'],
        difficulty: 'intermediate',
        instructions: '1. Lie on bench\n2. Grip barbell slightly wider than shoulder width\n3. Lower to chest\n4. Press up explosively',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Running',
        description: 'Cardiovascular exercise for endurance and fat loss.',
        category: 'cardio',
        muscleGroups: ['legs', 'core'],
        equipment: [],
        difficulty: 'beginner',
        instructions: 'Maintain steady pace, focus on breathing rhythm.',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Squat',
        description: 'Fundamental lower body compound movement.',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: ['barbell', 'rack'],
        difficulty: 'intermediate',
      },
    }),
  ]);

  console.log('✓ Created 3 exercises');

  // Create fitness goals
  const goal1 = await prisma.fitnessGoal.create({
    data: {
      userId: user1.id,
      goalType: 'muscle_gain',
      title: 'Build Muscle Mass',
      description: 'Gain 5kg of lean muscle in 3 months',
      targetValue: 85,
      currentValue: 80,
      unit: 'kg',
      startDate: new Date('2024-01-01'),
      targetDate: new Date('2024-04-01'),
      status: 'active',
      progressPercentage: 60,
    },
  });

  await prisma.fitnessGoal.create({
    data: {
      userId: user2.id,
      goalType: 'weight_loss',
      title: 'Weight Loss Journey',
      description: 'Lose 10kg in a healthy way over 6 months',
      targetValue: 55,
      currentValue: 60,
      unit: 'kg',
      startDate: new Date('2024-01-01'),
      targetDate: new Date('2024-07-01'),
      status: 'active',
      progressPercentage: 50,
    },
  });

  console.log('✓ Created 2 fitness goals');

  // Create workouts
  const workout1 = await prisma.workout.create({
    data: {
      userId: user1.id,
      goalId: goal1.id,
      title: 'Upper Body Strength',
      description: 'Focus on chest and shoulders',
      workoutType: 'strength',
      scheduledDate: new Date(),
      durationMinutes: 60,
      intensity: 'high',
      status: 'completed',
      completedAt: new Date(),
    },
  });

  await prisma.workoutExercise.createMany({
    data: [
      {
        workoutId: workout1.id,
        exerciseId: exercises[0].id,
        sets: 4,
        reps: 8,
        weight: 80,
        orderIndex: 1,
      },
      {
        workoutId: workout1.id,
        exerciseId: exercises[2].id,
        sets: 3,
        reps: 10,
        weight: 100,
        orderIndex: 2,
      },
    ],
  });

  console.log('✓ Created 1 workout with exercises');

  // Create nutrition plan
  const nutritionPlan = await prisma.nutritionPlan.create({
    data: {
      userId: user1.id,
      goalId: goal1.id,
      title: 'Muscle Gain Diet',
      description: 'High protein diet for muscle building',
      dailyCaloriesTarget: 2800,
      proteinGramsTarget: 180,
      carbsGramsTarget: 300,
      fatsGramsTarget: 80,
      startDate: new Date('2024-01-01'),
      isActive: true,
    },
  });

  await prisma.meal.create({
    data: {
      nutritionPlanId: nutritionPlan.id,
      userId: user1.id,
      mealType: 'breakfast',
      date: new Date(),
      title: 'Protein Pancakes',
      description: 'Oats, eggs, banana, protein powder',
      calories: 450,
      proteinGrams: 35,
      carbsGrams: 50,
      fatsGrams: 12,
    },
  });

  console.log('✓ Created 1 nutrition plan with meal');

  // Create consultation
  const consultation = await prisma.consultation.create({
    data: {
      userId: user1.id,
      trainerId: trainer.id,
      sessionType: 'one_time',
      title: 'Initial Consultation',
      description: 'Discuss fitness goals and create workout plan',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      durationMinutes: 60,
      status: 'scheduled',
      price: 50,
      paymentStatus: 'pending',
    },
  });

  console.log('✓ Created 1 consultation');

  // Create messages
  await prisma.message.createMany({
    data: [
      {
        consultationId: consultation.id,
        senderId: user1.id,
        receiverId: trainerUser.id,
        content: 'Hi Mike! Looking forward to our consultation next week.',
        messageType: 'text',
        isRead: false,
      },
      {
        consultationId: consultation.id,
        senderId: trainerUser.id,
        receiverId: user1.id,
        content: 'Hello John! Me too. Please bring your workout history if you have any.',
        messageType: 'text',
        isRead: true,
      },
    ],
  });

  console.log('✓ Created 2 messages');

  // Create AI recommendation
  await prisma.aIRecommendation.create({
    data: {
      userId: user1.id,
      recommendationType: 'workout',
      context: {
        goal: 'muscle_gain',
        experience: 'intermediate',
      },
      prompt: 'Create a workout plan for muscle gain',
      recommendationText:
        'Based on your goal of muscle gain, I recommend a 4-day split:\n\n1. Day 1: Chest & Triceps\n2. Day 2: Back & Biceps\n3. Day 3: Rest\n4. Day 4: Legs\n5. Day 5: Shoulders & Abs\n6. Days 6-7: Rest\n\nFocus on compound movements with 3-4 sets of 8-12 reps.',
      aiModel: 'gemini-1.5-flash',
      metadata: {
        tokensUsed: 150,
        confidence: 0.95,
      },
    },
  });

  console.log('✓ Created 1 AI recommendation');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- 3 users (including 1 trainer)');
  console.log('- 1 trainer profile');
  console.log('- 3 exercises');
  console.log('- 2 fitness goals');
  console.log('- 1 workout with exercises');
  console.log('- 1 nutrition plan with meal');
  console.log('- 1 consultation');
  console.log('- 2 messages');
  console.log('- 1 AI recommendation');
  console.log('\n🔐 Test Credentials:');
  console.log('Email: john.doe@example.com');
  console.log('Email: jane.smith@example.com');
  console.log('Email: mike.trainer@example.com');
  console.log('Password: Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
