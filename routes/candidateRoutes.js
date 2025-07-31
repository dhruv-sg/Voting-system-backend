// const express = require('express');
// const router = express.Router();
// const Candidate = require('./../models/candidate');
// const User = require('./../models/user'); // ✅ Fixed import
// const { jwtAuthMiddleware } = require('./../jwt');

// // 🔍 Check if user is an admin
// const checkAdminRole = async (userId) => {
//   try {
//     const user = await User.findById(userId);
//     return user.role === 'admin';
//   } catch {
//     return false;
//   }
// };

// // ✅ Create new candidate (admin only)
// router.post('/signup', jwtAuthMiddleware, async (req, res) => {
//   try {
//     if (!(await checkAdminRole(req.user.id)))
//       return res.status(403).json({ message: 'User is not an admin' });

//     const data = req.body;
//     const newCandidate = new Candidate(data);
//     const response = await newCandidate.save();

//     res.status(200).json(response);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // ✅ Update candidate
// router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
//   try {
//     if (!(await checkAdminRole(req.user.id)))
//       return res.status(403).json({ message: 'User is not an admin' });

//     const candidateId = req.params.candidateId;
//     const updatedCandidateData = req.body;

//     const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
//       new: true,
//       runValidators: true, // ✅ Fixed typo
//     });

//     if (!response) {
//       return res.status(404).json({ error: 'Candidate not found' }); // ✅ Fixed error chaining
//     } 

//     console.log('Candidate updated');
//     res.status(200).json(response);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // ✅ Delete candidate
// router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
//   try {
//     if (!(await checkAdminRole(req.user.id)))
//       return res.status(403).json({ message: 'User is not an admin' });

//     const candidateID = req.params.candidateID;

//     const response = await Candidate.findByIdAndDelete(candidateID);

//     if (!response) {
//       return res.status(404).json({ error: 'Candidate not found' });
//     }

//     console.log('Candidate deleted');
//     res.status(200).json(response);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware } = require('../jwt');
const Candidate = require('../models/candidate');

// 🔒 Admin check helper
const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        return user.role === 'admin';
    } catch (err) {
        return false;
    }
};

// Create candidate (admin only)
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({ message: 'User does not have admin role' });

        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();

        console.log('Candidate saved');
        res.status(200).json({ response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//  Update candidate
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({ message: 'User does not have admin role' });

        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true,
            runValidators: true,
        });

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ✅ Delete candidate
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({ message: 'User does not have admin role' });

        const candidateID = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate deleted');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//  Get vote count for all candidates (PLACE BEFORE /vote/:candidateID)
router.get('/vote/count', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: 'desc' });
        const voteRecord = candidates.map((data) => ({
            party: data.party,
            count: data.voteCount
        }));

        return res.status(200).json(voteRecord);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try {
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Admin is not allowed to vote' });
        }

        if (user.isVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Additional double-check against candidate vote list
        const alreadyVoted = candidate.votes.some(v => v.user.toString() === userId.toString());
        if (alreadyVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        user.isVoted = true;
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



//  Get list of candidates (name + party)
router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find({}, 'name party -_id');
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all users who have voted (admin only)
// Get all voters (admin only)
router.get('/voters', jwtAuthMiddleware, async (req, res) => {
    try {
        const requestingUser = await User.findById(req.user.id);

        if (!requestingUser || requestingUser.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can access the voters list' });
        }

        const allUsers = await User.find().select('-password');

        res.status(200).json(allUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;

