const models = require('../models');
const Domo = models.Domo;

const makerPage = async (req,res) => {
    return res.render('app');
};

const makeDomo = async (req, res) => {
    if (!req.body.name || !req.body.age || !req.body.level) {
        return res.status(400).json({ error: 'Name, age, and level are required' });
    }

    const domoData = {
        name: req.body.name,
        age: req.body.age,
        level: req.body.level,
        owner: req.session.account._id,
    };

    try {
        const newDomo = new Domo(domoData);
        await newDomo.save();
        return res.status(201).json({
            name: newDomo.name,
            age: newDomo.age,
            level: newDomo.level,
        });
    } catch (err) {
        console.log(err);
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Domo already exists!' });
        }
        return res.status(500).json({ error: 'An error occurred making domo' });
    }
};

const getDomos = async (req, res) => {
    try{
        const query = {owner: req.session.account._id};
        const docs = await Domo.find(query).select('name age level').lean().exec();

        return res.json({domos: docs});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({error: 'Error retrieving domos!'})
    }
};

const deleteDomo = async (req, res) => {
    try {
        const { id } = req.body;

        const result = await Domo.deleteOne({
            _id: id,
            owner: req.session.account._id,
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Domo not found or not owned by user.' });
        }

        return res.status(200).json({ message: 'Domo deleted.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error deleting Domo.' });
    }
};


module.exports = {
    makerPage,
    makeDomo,
    getDomos,
    deleteDomo,
};