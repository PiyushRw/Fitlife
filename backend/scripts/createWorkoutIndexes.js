import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Workout } from '../models/Workout.js';

dotenv.config();

async function createIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Create indexes
    console.log('Creating indexes...');
    
    // Index for public workouts listing
    await Workout.collection.createIndex(
      { isPublic: 1, createdAt: -1 },
      { name: 'public_workouts' }
    );

    // Index for search
    await Workout.collection.createIndex(
      { title: 'text', tags: 1 },
      { 
        name: 'workout_search',
        weights: {
          title: 10,
          tags: 5
        }
      }
    );

    // Index for type and difficulty filtering
    await Workout.collection.createIndex(
      { type: 1, difficulty: 1, isPublic: 1 },
      { name: 'type_difficulty_filter' }
    );

    console.log('Indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();
