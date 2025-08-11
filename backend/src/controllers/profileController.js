const bcrypt = require('bcryptjs');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, bio, linkedin, skills, wallet, is_admin, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, linkedin, skills } = req.body;
    const supabase = req.app.locals.supabase;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        name: name || undefined,
        bio: bio || undefined,
        linkedin: linkedin || undefined,
        skills: skills || undefined
      })
      .eq('id', req.user.userId)
      .select('id, name, email, bio, linkedin, skills, wallet, is_admin, created_at')
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({ message: 'Error updating profile' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const supabase = req.app.locals.supabase;

    // Get current user to verify password
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.userId)
      .single();

    if (findError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', req.user.userId);

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(500).json({ message: 'Error updating password' });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Connect wallet
const connectWallet = async (req, res) => {
  try {
    const { wallet } = req.body;
    const supabase = req.app.locals.supabase;

    const { error } = await supabase
      .from('users')
      .update({ wallet })
      .eq('id', req.user.userId);

    if (error) {
      console.error('Wallet connection error:', error);
      return res.status(500).json({ message: 'Error connecting wallet' });
    }

    res.json({ message: 'Wallet connected successfully' });
  } catch (error) {
    console.error('Connect wallet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = req.app.locals.supabase;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, bio, linkedin, skills, wallet, created_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { q, skills } = req.query;
    const supabase = req.app.locals.supabase;

    let query = supabase
      .from('users')
      .select('id, name, bio, linkedin, skills, created_at')
      .neq('id', req.user.userId);

    if (q) {
      query = query.or(`name.ilike.%${q}%,bio.ilike.%${q}%`);
    }

    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      query = query.overlaps('skills', skillArray);
    }

    const { data: users, error } = await query.limit(20);

    if (error) {
      console.error('User search error:', error);
      return res.status(500).json({ message: 'Error searching users' });
    }

    res.json({ users: users || [] });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  connectWallet,
  getUserById,
  searchUsers
}; 