import Testimonial from '../models/Testimonial.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// @desc    Create a new testimonial
// @route   POST /api/v1/testimonials
// @access  Private
export const createTestimonial = catchAsync(async (req, res, next) => {
  const { content, rating, name, role } = req.body;
  
  // Create and auto-approve the testimonial
  const testimonial = await Testimonial.create({
    content,
    rating,
    name: name || req.user?.name || 'Anonymous',
    role: role || 'Member',
    user: req.user?._id || null,
    status: 'approved', // Auto-approve for demo
    createdAt: new Date() // Explicitly set creation date
  });
  
  console.log('Created new testimonial:', JSON.stringify({
    ...testimonial.toObject(),
    id: testimonial._id
  }, null, 2));

  res.status(201).json({
    status: 'success',
    data: {
      testimonial
    }
  });
});

// @desc    Get all testimonials (filtered, sorted, paginated)
// @route   GET /api/v1/testimonials
// @access  Public
export const getAllTestimonials = catchAsync(async (req, res, next) => {
  try {
    // 1) Filtering - Only show approved testimonials by default
    const queryObj = { status: 'approved' }; // Only approved testimonials by default
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    
    // Only include query parameters that are not in excludedFields
    // and explicitly set status to approved to override any other status filter
    Object.entries(req.query).forEach(([key, value]) => {
      if (!excludedFields.includes(key) && key !== 'status') {
        queryObj[key] = value;
      }
    });
    
    console.log('Query parameters:', JSON.stringify({
      originalQuery: req.query,
      finalQuery: queryObj
    }, null, 2));

    console.log('Final query object:', JSON.stringify(queryObj, null, 2)); // Debug log

    // 2) Build query
    let query = Testimonial.find(queryObj);

    // 3) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 4) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 5) Execute the query with sorting and limiting
    console.log('Executing query with filter:', JSON.stringify(queryObj, null, 2));
    
    let userTestimonials = [];
    
    try {
      // First get the count for pagination
      const total = await Testimonial.countDocuments(queryObj);
      console.log(`Found ${total} approved testimonials in DB`);
      
      // Log the actual query being executed
      const queryStr = Testimonial.find(queryObj).sort('-createdAt').getQuery();
      console.log('MongoDB Query:', JSON.stringify(queryStr, null, 2));
      
      // Get all testimonials that match the query (no limit yet)
      const allTestimonials = await Testimonial.find(queryObj).lean();
      console.log('All testimonials in DB:', JSON.stringify({
        count: allTestimonials.length,
        items: allTestimonials.map(t => ({
          _id: t._id,
          name: t.name,
          status: t.status,
          content: t.content.substring(0, 30) + '...',
          createdAt: t.createdAt,
          updatedAt: t.updatedAt
        }))
      }, null, 2));
      
      // Then get the actual data with sorting and limit
      userTestimonials = await Testimonial.find({
        ...queryObj,
        status: 'approved' // Force approved status
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean()
      .exec(); // Force execution of the query
      
      console.log('Query results (limited to 3):', JSON.stringify({
        count: userTestimonials.length,
        items: userTestimonials.map(t => ({
          _id: t._id,
          name: t.name,
          status: t.status,
          content: t.content.substring(0, 30) + '...',
          createdAt: t.createdAt,
          isDefault: false
        }))
      }, null, 2));
    } catch (error) {
      console.error('Error querying testimonials:', error);
      // In case of error, return empty array instead of throwing
      // This will make the function return default testimonials
      userTestimonials = [];
    }

    // Define default testimonials with proper structure
    const defaultTestimonials = [
      {
        _id: 'default1',
        content: 'FitLife has completely transformed my fitness journey! The personalized workout plans and nutrition guidance are top-notch.',
        rating: 5,
        name: 'Sarah Johnson',
        role: 'Fitness Enthusiast',
        status: 'approved',
        user: null,
        createdAt: new Date('2024-06-15'),
        updatedAt: new Date('2024-06-15'),
        __v: 0
      },
      {
        _id: 'default2',
        content: 'As a beginner, I was intimidated by the gym. FitLife made it easy to get started with clear instructions and progress tracking.',
        rating: 5,
        name: 'Michael Chen',
        role: 'Beginner',
        status: 'approved',
        user: null,
        createdAt: new Date('2024-06-10'),
        updatedAt: new Date('2024-06-10'),
        __v: 0
      },
      {
        _id: 'default3',
        content: 'The community support and expert advice have kept me motivated throughout my fitness journey. Highly recommended!',
        rating: 4,
        name: 'Emma Davis',
        role: 'Yoga Instructor',
        status: 'approved',
        user: null,
        createdAt: new Date('2024-06-05'),
        updatedAt: new Date('2024-06-05'),
        __v: 0
      }
    ].map(testimonial => ({
      ...testimonial,
      toObject: () => testimonial,
      _doc: testimonial
    }));

    // Combine user testimonials with defaults (up to 3 total)
    const maxTestimonials = 3;
    let combinedTestimonials = [];
    
    // 1. Add user testimonials first (up to maxTestimonials)
    const userTestimonialsToShow = userTestimonials.slice(0, maxTestimonials);
    combinedTestimonials = [...userTestimonialsToShow];
    
    // 2. If we need more, add default testimonials (up to maxTestimonials total)
    if (combinedTestimonials.length < maxTestimonials) {
      const needed = maxTestimonials - combinedTestimonials.length;
      const defaultToAdd = defaultTestimonials
        .filter(t => !combinedTestimonials.some(ut => ut.content === t.content))
        .slice(0, needed);
      
      combinedTestimonials = [...combinedTestimonials, ...defaultToAdd];
    }
    
    console.log('Final combined testimonials:', JSON.stringify({
      count: combinedTestimonials.length,
      sources: {
        user: userTestimonialsToShow.length,
        default: combinedTestimonials.length - userTestimonialsToShow.length
      },
      items: combinedTestimonials.map(t => ({
        id: t._id || t.id,
        name: t.name,
        isDefault: !t._id
      }))
    }, null, 2));
    
    // Make sure we don't exceed the maximum
    combinedTestimonials = combinedTestimonials.slice(0, maxTestimonials);
    
    // If we still don't have any testimonials, use all defaults
    if (combinedTestimonials.length === 0) {
      combinedTestimonials = defaultTestimonials.slice(0, maxTestimonials);
    }

    res.status(200).json({
      status: 'success',
      results: combinedTestimonials.length,
      total: Math.max(total, combinedTestimonials.length),
      isDefault: combinedTestimonials.some(t => t._id.startsWith('default')),
      data: {
        testimonials: combinedTestimonials
      }
    });
  } catch (error) {
    console.error('Error in getAllTestimonials:', error);
    // Return default testimonials in case of error
    const defaultTestimonials = [
      {
        _id: 'default1',
        content: 'FitLife has completely transformed my fitness journey! The personalized workout plans and nutrition guidance are top-notch.',
        rating: 5,
        name: 'Sarah Johnson',
        role: 'Fitness Enthusiast',
        status: 'approved',
        createdAt: new Date('2024-06-15')
      },
      {
        _id: 'default2',
        content: 'As a beginner, I was intimidated by the gym. FitLife made it easy to get started with clear instructions and progress tracking.',
        rating: 5,
        name: 'Michael Chen',
        role: 'Beginner',
        status: 'approved',
        createdAt: new Date('2024-06-10')
      },
      {
        _id: 'default3',
        content: 'The community support and expert advice have kept me motivated throughout my fitness journey. Highly recommended!',
        rating: 4,
        name: 'Emma Davis',
        role: 'Yoga Instructor',
        status: 'approved',
        createdAt: new Date('2024-06-05')
      }
    ];

    res.status(200).json({
      status: 'success',
      results: defaultTestimonials.length,
      total: defaultTestimonials.length,
      isDefault: true,
      data: {
        testimonials: defaultTestimonials
      }
    });
  }
});

// @desc    Get a single testimonial
// @route   GET /api/v1/testimonials/:id
// @access  Public
export const getTestimonial = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return next(new AppError('No testimonial found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      testimonial
    }
  });
});

// @desc    Update a testimonial (admin only)
// @route   PATCH /api/v1/testimonials/:id
// @access  Private/Admin
export const updateTestimonial = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!testimonial) {
    return next(new AppError('No testimonial found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      testimonial
    }
  });
});

// @desc    Delete a testimonial (admin only)
// @route   DELETE /api/v1/testimonials/:id
// @access  Private/Admin
export const deleteTestimonial = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

  if (!testimonial) {
    return next(new AppError('No testimonial found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Get my testimonials
// @route   GET /api/v1/testimonials/my-testimonials
// @access  Private
export const getMyTestimonials = catchAsync(async (req, res, next) => {
  const testimonials = await Testimonial.find({ user: req.user._id });

  res.status(200).json({
    status: 'success',
    results: testimonials.length,
    data: {
      testimonials
    }
  });
});
