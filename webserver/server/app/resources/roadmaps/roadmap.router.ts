import express from "express";
import { Roadmap} from "./roadmap.model.js";
import { Op,QueryTypes } from'sequelize';
import { sequelize } from '../../db.js';
import { User } from '../user/user.model.js';

const router = express.Router();



router.get('/', async (req, res) => {
    const query = req.query.q || '';
    console.log("Received Query:", query);

    try {
        const results = await Roadmap.findAll({
            where: {
                title: {
                    [Op.like]: `%${query}%`,
                },
            },
            include: [{ model: User, attributes: ['id', 'username'] }],  
        });

        console.log("Results Found:", results);
        res.json(results);
    } catch (error) {
        console.error("Error fetching roadmaps:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/add', async (req, res) => {
    const { title, description, userId } = req.body;

    if (!title || !description || !userId) {
        return res.status(400).json({ error: 'Title, description, and user ID are required.' });
    }

    try {
        const newRoadmap = new Roadmap({ title, description, user: userId });
        await newRoadmap.save();
        res.status(201).json({ message: 'Roadmap added successfully!', roadmap: newRoadmap });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add roadmap.' });
    }
});

router.get('/seed', async (req, res) => {
    try {
        // Clear existing roadmaps (optional)
        await Roadmap.destroy({ where: {}, truncate: true });

      
        const roadmaps =   [
            {
                title: 'Web Development',
                description: `The Web Development Roadmap is designed to guide you through the technologies and tools required to become a full-stack web developer.\n\nIt covers front-end technologies like HTML, CSS, and JavaScript, as well as frameworks such as React and Angular.\n\nOn the back-end, you'll learn about Node.js, Express, and databases like MongoDB and SQL.\n\nResources to get started:\n- HTML & CSS: https://www.w3schools.com/html/\n- JavaScript Guide: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide\n- React Documentation: https://reactjs.org/docs/getting-started.html\n- Node.js Official Site: https://nodejs.org/en/docs/`,
                userId: '1'
            },
            {
                title: 'Machine Learning',
                description: `The Machine Learning Roadmap helps you navigate the landscape of machine learning and AI.\n\nIt covers essential topics like supervised and unsupervised learning, neural networks, and natural language processing.\n\nYou will learn to work with popular libraries like TensorFlow and Scikit-learn.\n\nKey resources include:\n- Introduction to Machine Learning: https://www.coursera.org/learn/machine-learning\n- TensorFlow Documentation: https://www.tensorflow.org/learn\n- Scikit-learn User Guide: https://scikit-learn.org/stable/user_guide.html`,
                userId: '1'
            },
            {
                title: 'Data Science',
                description: `The Data Science Roadmap will introduce you to the world of data analytics and visualization.\n\nIt covers statistical analysis, data wrangling, and visualization techniques using libraries like Pandas and Matplotlib.\n\nYou'll also learn about data storytelling and presentation skills.\n\nResources to consider:\n- Data Science Specialization: https://www.coursera.org/specializations/jhu-data-science\n- Pandas Documentation: https://pandas.pydata.org/docs/\n- Matplotlib Tutorial: https://matplotlib.org/stable/tutorials/index.html`,
                userId: '1'
            },
            {
                title: 'Mobile Development',
                description: `The Mobile Development Roadmap focuses on creating applications for iOS and Android platforms.\n\nYou will learn about Swift and Kotlin programming languages, as well as frameworks like React Native and Flutter.\n\nThe roadmap also includes topics on UI/UX design and mobile app testing.\n\nHelpful resources:\n- Swift Programming Language: https://swift.org/documentation/\n- Kotlin Documentation: https://kotlinlang.org/docs/home.html\n- React Native Docs: https://reactnative.dev/docs/getting-started`,
                userId: '1'
            },
            {
                title: 'Cloud Computing',
                description: `The Cloud Computing Roadmap provides insights into cloud services and architecture.\n\nYou'll explore AWS, Azure, and Google Cloud Platform, learning about cloud storage, computing, and networking.\n\nThe roadmap also covers DevOps practices and CI/CD pipelines.\n\nStart with these resources:\n- AWS Training and Certification: https://aws.amazon.com/training/\n- Azure Fundamentals: https://learn.microsoft.com/en-us/learn/paths/azure-fundamentals/\n- Google Cloud Training: https://cloud.google.com/training`,
                userId: '1'
            },
            {
                title: 'Cybersecurity',
                description: `The Cybersecurity Roadmap outlines the essential skills needed to protect information systems.\n\nTopics include network security, risk assessment, and ethical hacking.\n\nYou'll also learn about compliance frameworks and security protocols.\n\nRecommended resources:\n- Cybersecurity Basics: https://www.cybrary.it/course/cybersecurity-fundamentals/\n- OWASP Top Ten: https://owasp.org/www-project-top-ten/\n- CompTIA Security+ Certification: https://www.comptia.org/certifications/security`,
                userId: '1'
            },
            {
                title: 'Game Development',
                description: `The Game Development Roadmap will guide you through the process of creating video games.\n\nYou will learn programming with C# and C++, along with game engines like Unity and Unreal Engine.\n\nThe roadmap also includes graphics design and game mechanics.\n\nResources to get started:\n- Unity Learn: https://learn.unity.com/\n- Unreal Engine Documentation: https://docs.unrealengine.com/en-US/index.html\n- Game Development Course: https://www.udemy.com/course/unitycourse/`,
                userId: '1'
            },
            {
                title: 'Blockchain Development',
                description: `The Blockchain Development Roadmap introduces you to decentralized applications.\n\nYou will learn about smart contracts, Ethereum, and Solidity programming.\n\nAdditionally, the roadmap covers security best practices in blockchain.\n\nUseful resources include:\n- Ethereum Documentation: https://ethereum.org/en/developers/docs/\n- Solidity Documentation: https://docs.soliditylang.org/en/v0.8.0/\n- Blockchain Basics: https://www.coursera.org/learn/blockchain-basics`,
                userId: '1'
            },
            {
                title: 'DevOps',
                description: `The DevOps Roadmap focuses on the practices and tools that enhance collaboration between development and operations.\n\nYou'll learn about continuous integration, continuous delivery, and infrastructure as code.\n\nThe roadmap includes popular tools like Docker, Kubernetes, and Jenkins.\n\nKey resources to explore:\n- DevOps Handbook: https://www.amazon.com/DevOps-Handbook-Technology-Organizational-Transformation/dp/1942788291\n- Docker Documentation: https://docs.docker.com/get-started/\n- Kubernetes Documentation: https://kubernetes.io/docs/home/`,
                userId: '1'
            },
            {
                title: 'Artificial Intelligence',
                description: `The Artificial Intelligence Roadmap covers the fundamentals of AI and machine learning.\n\nTopics include natural language processing, computer vision, and reinforcement learning.\n\nYou'll also learn about ethical considerations in AI development.\n\nResources for further learning:\n- AI For Everyone: https://www.coursera.org/learn/ai-for-everyone\n- Stanford's AI Course: https://cs229.stanford.edu/\n- MIT OpenCourseWare: https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-034-artificial-intelligence-spring-2010/`,
                userId: '1'
            }
        ];
        
        

        await Roadmap.bulkCreate(roadmaps);
        res.status(201).json({ message: 'Roadmaps created successfully!' });
    } catch (error) {
        console.error("Error seeding database:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
router.get('/:id', async (req, res) => {
    const roadmapId = req.params.id;
    console.log("Fetching roadmap with ID:", roadmapId);

    try {
        const roadmap = await Roadmap.findOne({
            where: { id: roadmapId },
            include: [{ model: User, attributes: ['id', 'username'] }]  
        });

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        console.log("Roadmap Found:", roadmap);
        res.json(roadmap);
    } catch (error) {
        console.error("Error fetching roadmap:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



export default router;