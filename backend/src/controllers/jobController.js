// Create new job
const createJob = async (req, res) => {
  try {
    const { title, description, skills, salary, location } = req.body;
    const supabase = req.app.locals.supabase;

    const { data: newJob, error } = await supabase
      .from('jobs')
      .insert([
        {
          title,
          description,
          skills: skills || [],
          salary: parseFloat(salary),
          location: location || '',
          posted_by: req.user.userId
        }
      ])
      .select(`
        *,
        users:posted_by(name, email)
      `)
      .single();

    if (error) {
      console.error('Job creation error:', error);
      return res.status(500).json({ message: 'Error creating job' });
    }

    res.status(201).json({
      message: 'Job created successfully',
      job: newJob
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all jobs with filters
const getJobs = async (req, res) => {
  try {
    const { skills, location, page = 1, limit = 10 } = req.query;
    const supabase = req.app.locals.supabase;

    let query = supabase
      .from('jobs')
      .select(`
        *,
        users:posted_by(name, email)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      query = query.overlaps('skills', skillArray);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: jobs, error, count } = await query;

    if (error) {
      console.error('Get jobs error:', error);
      return res.status(500).json({ message: 'Error fetching jobs' });
    }

    res.json({
      jobs: jobs || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get job by ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = req.app.locals.supabase;

    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
        users:posted_by(name, email)
      `)
      .eq('id', id)
      .single();

    if (error || !job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update job
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, skills, salary, location } = req.body;
    const supabase = req.app.locals.supabase;

    // Check if user owns the job
    const { data: existingJob, error: checkError } = await supabase
      .from('jobs')
      .select('posted_by')
      .eq('id', id)
      .single();

    if (checkError || !existingJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (existingJob.posted_by !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    // Update job
    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update({
        title: title || undefined,
        description: description || undefined,
        skills: skills || undefined,
        salary: salary ? parseFloat(salary) : undefined,
        location: location || undefined
      })
      .eq('id', id)
      .select(`
        *,
        users:posted_by(name, email)
      `)
      .single();

    if (updateError) {
      console.error('Job update error:', updateError);
      return res.status(500).json({ message: 'Error updating job' });
    }

    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = req.app.locals.supabase;

    // Check if user owns the job
    const { data: existingJob, error: checkError } = await supabase
      .from('jobs')
      .select('posted_by')
      .eq('id', id)
      .single();

    if (checkError || !existingJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (existingJob.posted_by !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    // Delete job
    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Job deletion error:', deleteError);
      return res.status(500).json({ message: 'Error deleting job' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's jobs
const getUserJobs = async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('posted_by', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get user jobs error:', error);
      return res.status(500).json({ message: 'Error fetching user jobs' });
    }

    res.json({ jobs: jobs || [] });
  } catch (error) {
    console.error('Get user jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getUserJobs
}; 