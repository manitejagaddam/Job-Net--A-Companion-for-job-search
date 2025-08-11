const { extractSkills, calculateMatchScore, getJobRecommendations } = require('../utils/ai');

// Extract skills from text
const extractSkillsFromText = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const skills = await extractSkills(text);
    
    res.json({
      skills,
      count: skills.length
    });
  } catch (error) {
    console.error('Extract skills error:', error);
    res.status(500).json({ message: 'Error extracting skills' });
  }
};

// Calculate match score between job and candidate
const calculateJobMatch = async (req, res) => {
  try {
    const { jobId } = req.params;
    const supabase = req.app.locals.supabase;

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('skills')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get user skills
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('skills')
      .eq('id', req.user.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const matchScore = calculateMatchScore(job.skills || [], user.skills || []);

    res.json({
      jobId,
      matchScore: Math.round(matchScore * 100) / 100,
      jobSkills: job.skills || [],
      userSkills: user.skills || []
    });
  } catch (error) {
    console.error('Calculate job match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get job recommendations for user
const getRecommendations = async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    // Get user skills
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('skills')
      .eq('id', req.user.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all jobs
    const { data: allJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (jobsError) {
      console.error('Get jobs error:', jobsError);
      return res.status(500).json({ message: 'Error fetching jobs' });
    }

    const recommendations = await getJobRecommendations(user.skills || [], allJobs || []);

    res.json({
      recommendations,
      userSkills: user.skills || []
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user skills from text
const updateSkillsFromText = async (req, res) => {
  try {
    const { text } = req.body;
    const supabase = req.app.locals.supabase;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Extract skills from text
    const extractedSkills = await extractSkills(text);

    // Update user skills
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ skills: extractedSkills })
      .eq('id', req.user.userId)
      .select('skills')
      .single();

    if (error) {
      console.error('Update skills error:', error);
      return res.status(500).json({ message: 'Error updating skills' });
    }

    res.json({
      message: 'Skills updated successfully',
      skills: updatedUser.skills,
      count: updatedUser.skills.length
    });
  } catch (error) {
    console.error('Update skills from text error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get similar jobs
const getSimilarJobs = async (req, res) => {
  try {
    const { jobId } = req.params;
    const supabase = req.app.locals.supabase;

    // Get target job
    const { data: targetJob, error: targetError } = await supabase
      .from('jobs')
      .select('skills, title')
      .eq('id', jobId)
      .single();

    if (targetError || !targetJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get all other jobs
    const { data: allJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .neq('id', jobId)
      .order('created_at', { ascending: false });

    if (jobsError) {
      console.error('Get jobs error:', jobsError);
      return res.status(500).json({ message: 'Error fetching jobs' });
    }

    // Calculate similarity scores
    const similarJobs = allJobs.map(job => ({
      job,
      similarity: calculateMatchScore(targetJob.skills || [], job.skills || [])
    }));

    // Sort by similarity and return top 5
    const topSimilar = similarJobs
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    res.json({
      targetJob: {
        id: jobId,
        title: targetJob.title,
        skills: targetJob.skills
      },
      similarJobs: topSimilar
    });
  } catch (error) {
    console.error('Get similar jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  extractSkillsFromText,
  calculateJobMatch,
  getRecommendations,
  updateSkillsFromText,
  getSimilarJobs
}; 