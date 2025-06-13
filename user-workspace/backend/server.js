const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let familyMembers = [];
let choreTemplates = [];

// Get all family members
app.get('/family-members', (req, res) => {
  res.json(familyMembers);
});

// Add a family member
app.post('/family-members', (req, res) => {
  const member = req.body;
  member.id = Date.now().toString();
  familyMembers.push(member);
  res.status(201).json(member);
});

// Delete a family member
app.delete('/family-members/:id', (req, res) => {
  const id = req.params.id;
  familyMembers = familyMembers.filter(m => m.id !== id);
  res.status(204).send();
});

// Get all chore templates
app.get('/chore-templates', (req, res) => {
  res.json(choreTemplates);
});

// Add a chore template
app.post('/chore-templates', (req, res) => {
  const chore = req.body;
  chore.id = Date.now().toString();
  choreTemplates.push(chore);
  res.status(201).json(chore);
});

// Delete a chore template
app.delete('/chore-templates/:id', (req, res) => {
  const id = req.params.id;
  choreTemplates = choreTemplates.filter(c => c.id !== id);
  res.status(204).send();
});

// Assign a chore from template to a family member
app.post('/family-members/:memberId/chores/template/:templateId', (req, res) => {
  const { memberId, templateId } = req.params;
  const member = familyMembers.find(m => m.id === memberId);
  
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }

  const template = choreTemplates.find(t => t.id === templateId);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const newChore = {
    id: Date.now().toString(),
    name: template.name,
    description: template.description,
    completed: false,
    dueDate: new Date(),
    recurrence: template.recurrence,
    days: template.days
  };

  member.chores.push(newChore);
  res.status(201).json(newChore);
});

// Unassign a chore from a family member
app.delete('/family-members/:memberId/chores/:choreId', (req, res) => {
  const { memberId, choreId } = req.params;
  const member = familyMembers.find(m => m.id === memberId);
  
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }

  member.chores = member.chores.filter(c => c.id !== choreId);
  res.status(204).send();
});

app.listen(port, () => {
  console.log('Backend API listening at http://localhost:' + port);
});
