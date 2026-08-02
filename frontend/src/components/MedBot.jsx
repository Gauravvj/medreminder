import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/* ──────────────────────────────────────────────────────────
   MedBot — Self-contained AI Health Chatbot
   Uses keyword matching + a rich medical knowledge base.
   No external API needed — runs entirely in the browser.
   ────────────────────────────────────────────────────────── */

// ── Medical Knowledge Base ──────────────────────────────
const medicalKB = [
  {
    keywords: ['headache', 'head pain', 'head ache', 'migraine', 'head hurts'],
    response: `🧠 **Headache / Migraine Tips:**\n\n• Stay hydrated — drink at least 8 glasses of water a day.\n• Rest in a quiet, dark room and close your eyes for 15–20 minutes.\n• Apply a cold or warm compress to your forehead or neck.\n• Avoid bright screens and loud noises.\n• Try gentle neck stretches and deep breathing.\n\n⚠️ **See a doctor if:** headaches are frequent, very severe, or come with vision changes, confusion, or fever.`
  },
  {
    keywords: ['fever', 'high temperature', 'chills', 'feeling hot'],
    response: `🌡️ **Fever Management:**\n\n• Rest as much as possible — your body is fighting an infection.\n• Drink plenty of fluids (water, soups, herbal teas).\n• Use a cool, damp cloth on your forehead.\n• Wear light, comfortable clothing.\n• Eat light, nutritious meals even if your appetite is low.\n\n⚠️ **See a doctor if:** fever exceeds 103°F (39.4°C), lasts more than 3 days, or comes with stiff neck, rash, or difficulty breathing.`
  },
  {
    keywords: ['cold', 'cough', 'runny nose', 'sore throat', 'congestion', 'sneezing', 'flu', 'influenza'],
    response: `🤧 **Cold & Flu Relief:**\n\n• Get plenty of rest and sleep.\n• Stay hydrated with warm fluids — tea with honey, warm water with lemon.\n• Gargle with warm salt water for a sore throat.\n• Use steam inhalation to relieve congestion.\n• Eat vitamin C-rich foods (oranges, lemons, bell peppers).\n\n⚠️ **See a doctor if:** symptoms last more than 10 days, you have difficulty breathing, or feel chest pain.`
  },
  {
    keywords: ['stomach', 'nausea', 'vomiting', 'stomach ache', 'belly', 'abdominal pain', 'indigestion', 'gastric'],
    response: `🤢 **Stomach & Digestive Issues:**\n\n• Eat small, bland meals — rice, bananas, toast, applesauce (the BRAT diet).\n• Sip ginger tea or peppermint tea to ease nausea.\n• Avoid spicy, fried, and fatty foods.\n• Stay hydrated with clear fluids.\n• Avoid lying down immediately after eating.\n\n⚠️ **See a doctor if:** you have severe pain, blood in vomit or stool, or symptoms last more than 48 hours.`
  },
  {
    keywords: ['diarrhea', 'loose stool', 'loose motion', 'watery stool'],
    response: `💧 **Diarrhea Management:**\n\n• Drink ORS (Oral Rehydration Solution) or plenty of water to prevent dehydration.\n• Eat the BRAT diet: Bananas, Rice, Applesauce, Toast.\n• Avoid dairy, caffeine, and high-fiber foods temporarily.\n• Wash hands frequently to prevent spreading.\n• Rest and allow your body to recover.\n\n⚠️ **See a doctor if:** diarrhea lasts more than 2 days, you see blood, or feel very dehydrated (dry mouth, dizziness).`
  },
  {
    keywords: ['back pain', 'back ache', 'lower back', 'spine', 'back hurts'],
    response: `🦴 **Back Pain Relief:**\n\n• Apply ice for the first 48 hours, then switch to heat therapy.\n• Maintain good posture — sit straight and support your lower back.\n• Do gentle stretches and short walks (avoid bed rest for too long).\n• Sleep on a firm mattress with a pillow between your knees.\n• Strengthen your core muscles with light exercises.\n\n⚠️ **See a doctor if:** pain radiates down your legs, you feel numbness or tingling, or pain worsens over time.`
  },
  {
    keywords: ['anxiety', 'stress', 'worried', 'panic', 'nervous', 'anxious', 'tension', 'overwhelm'],
    response: `🧘 **Anxiety & Stress Management:**\n\n• Practice deep breathing: inhale 4 sec → hold 4 sec → exhale 6 sec.\n• Try the 5-4-3-2-1 grounding technique (notice 5 things you see, 4 you touch, etc.)\n• Take a short walk in nature or fresh air.\n• Limit caffeine and social media.\n• Talk to someone you trust about how you feel.\n• Maintain a regular sleep schedule.\n\n⚠️ **See a professional if:** anxiety interferes with daily life for more than 2 weeks.`
  },
  {
    keywords: ['sleep', 'insomnia', 'cant sleep', 'sleepless', 'trouble sleeping', 'restless'],
    response: `😴 **Better Sleep Tips:**\n\n• Keep a consistent sleep schedule — same bedtime and wake time daily.\n• Avoid screens (phone, TV) at least 1 hour before bed.\n• Make your room dark, cool, and quiet.\n• Avoid caffeine after 2 PM and heavy meals before bed.\n• Try relaxation techniques like reading, gentle stretching, or meditation.\n• Limit naps to 20–30 minutes during the day.\n\n⚠️ **See a doctor if:** insomnia persists for more than 4 weeks.`
  },
  {
    keywords: ['diabetes', 'blood sugar', 'sugar level', 'insulin', 'diabetic'],
    response: `🩸 **Diabetes Management Tips:**\n\n• Monitor your blood sugar levels regularly as advised.\n• Eat a balanced diet rich in fiber, vegetables, and whole grains.\n• Avoid sugary drinks, refined carbs, and processed foods.\n• Exercise for at least 30 minutes daily (walking, cycling).\n• Take medications on time as prescribed.\n• Stay hydrated and manage stress.\n\n⚠️ **See a doctor immediately if:** you experience extreme thirst, frequent urination, blurred vision, or unexplained weight loss.`
  },
  {
    keywords: ['blood pressure', 'bp', 'hypertension', 'high bp', 'low bp'],
    response: `❤️ **Blood Pressure Management:**\n\n• Reduce salt intake (aim for less than 5g/day).\n• Eat potassium-rich foods: bananas, spinach, sweet potatoes.\n• Exercise regularly — brisk walking for 30 min/day.\n• Limit alcohol and quit smoking.\n• Manage stress through meditation or deep breathing.\n• Monitor your BP regularly at home.\n\n⚠️ **See a doctor if:** BP readings are consistently above 140/90 or below 90/60, or you feel dizziness, chest pain, or shortness of breath.`
  },
  {
    keywords: ['allergy', 'allergic', 'rash', 'hives', 'itching', 'itchy', 'skin rash'],
    response: `🤧 **Allergy & Skin Rash Tips:**\n\n• Identify and avoid the allergen (food, pollen, dust, medication).\n• Apply cool compresses to itchy areas.\n• Wear loose, soft cotton clothing.\n• Keep skin moisturized with gentle, fragrance-free lotions.\n• Avoid scratching — trim nails short.\n• Keep your living space clean and dust-free.\n\n⚠️ **See a doctor immediately if:** you have swelling of face/throat, difficulty breathing, or a widespread rash after taking medicine.`
  },
  {
    keywords: ['joint pain', 'arthritis', 'knee pain', 'joint', 'swollen joint', 'stiff joints'],
    response: `🦵 **Joint Pain & Arthritis Tips:**\n\n• Apply warm compresses to stiff joints in the morning.\n• Do gentle range-of-motion exercises daily.\n• Maintain a healthy weight to reduce stress on joints.\n• Include anti-inflammatory foods: fish, turmeric, ginger, berries.\n• Use supportive footwear and avoid prolonged standing.\n• Stay active — swimming and cycling are joint-friendly exercises.\n\n⚠️ **See a doctor if:** joints are red, hot, and swollen, pain is severe, or movement becomes very limited.`
  },
  {
    keywords: ['chest pain', 'heart', 'palpitation', 'chest tightness', 'heart attack'],
    response: `🚨 **Chest Pain — Take This Seriously!**\n\n• **If you are experiencing chest pain right now, please call emergency services (911 / 112) immediately.**\n• Sit down and rest — do not exert yourself.\n• Loosen any tight clothing.\n• If prescribed, take your heart medication.\n• Try to stay calm and take slow, deep breaths.\n\n⚠️ **Always seek emergency help if:** chest pain comes with shortness of breath, arm/jaw pain, sweating, or dizziness. Never ignore these symptoms.`
  },
  {
    keywords: ['tired', 'fatigue', 'exhausted', 'no energy', 'weak', 'lethargy', 'weakness'],
    response: `😩 **Fatigue & Low Energy Tips:**\n\n• Ensure you're getting 7–9 hours of quality sleep.\n• Stay hydrated — dehydration is a common cause of fatigue.\n• Eat balanced meals with iron-rich foods (spinach, lentils, eggs).\n• Exercise lightly — even a 20-minute walk boosts energy.\n• Reduce stress and take breaks during work.\n• Limit caffeine and sugar — they cause energy crashes.\n\n⚠️ **See a doctor if:** fatigue persists for more than 2 weeks, or comes with unexplained weight loss, fever, or pain.`
  },
  {
    keywords: ['medicine', 'medication', 'pill', 'tablet', 'dose', 'drug', 'forgot medicine', 'missed dose', 'when to take', 'after meal', 'before meal', 'before food', 'after food'],
    response: `💊 **Medicine & Dosage Tips:**\n\n• Always take medicines at the time prescribed by your doctor.\n• If you missed a dose, take it as soon as you remember — but skip it if it's almost time for the next dose. Never double up.\n• Some medicines work better on an empty stomach, others with food — check the label or ask your pharmacist.\n• Store medicines in a cool, dry place away from sunlight.\n• Use your MedReminder schedule to set alerts!\n• Never share prescription medicines with others.\n\n⚠️ **Always consult your doctor** before stopping or changing any medication.`
  },
  {
    keywords: ['diet', 'nutrition', 'food', 'eat', 'healthy food', 'what to eat', 'weight loss', 'weight gain'],
    response: `🥗 **Healthy Diet Tips:**\n\n• Eat a variety of fruits and vegetables daily (aim for 5 servings).\n• Choose whole grains over refined grains (brown rice, whole wheat).\n• Include lean proteins: chicken, fish, beans, lentils, eggs.\n• Limit added sugars, salt, and saturated fats.\n• Eat smaller, more frequent meals instead of 3 large ones.\n• Stay hydrated — water is the best drink!\n• Avoid processed and packaged foods when possible.\n\n💡 **A good rule:** fill half your plate with vegetables, a quarter with protein, and a quarter with whole grains.`
  },
  {
    keywords: ['exercise', 'workout', 'physical activity', 'fitness', 'walk', 'yoga'],
    response: `🏃 **Exercise & Fitness Tips:**\n\n• Aim for at least 30 minutes of moderate exercise daily.\n• Start slow if you're new — a 15-minute walk is a great start!\n• Mix cardio (walking, cycling) with light strength training.\n• Yoga and stretching improve flexibility and reduce stress.\n• Stay consistent — regular, light exercise beats occasional intense workouts.\n• Warm up before exercise and cool down after.\n\n⚠️ **Important:** consult your doctor before starting a new exercise routine, especially if you have heart, joint, or breathing conditions.`
  },
  {
    keywords: ['alzheimer', 'dementia', 'memory loss', 'forgetful', 'memory', 'cognitive'],
    response: `🧠 **Alzheimer's & Memory Support:**\n\n• Maintain a daily routine to provide structure and comfort.\n• Use labels, calendars, and reminder apps (like MedReminder!) to stay organized.\n• Engage in brain-stimulating activities: puzzles, reading, memory games.\n• Stay socially active — regular conversations help cognitive function.\n• Exercise regularly — it improves blood flow to the brain.\n• Eat a brain-healthy diet: fish, nuts, berries, leafy greens.\n\n💙 **Remember:** you are not alone. Reach out to caregivers, support groups, and healthcare professionals for help.`
  },
  {
    keywords: ['dehydration', 'water', 'thirst', 'dry mouth', 'not drinking enough'],
    response: `💧 **Staying Hydrated:**\n\n• Drink at least 8 glasses (2 liters) of water daily.\n• Increase intake in hot weather or after exercise.\n• Eat water-rich foods: watermelon, cucumber, oranges, soups.\n• Set reminders to drink water throughout the day.\n• Limit caffeine and alcohol — they can dehydrate you.\n• Signs of dehydration: dark urine, dry mouth, dizziness, fatigue.\n\n⚠️ **Seek help if:** you can't keep fluids down, feel very dizzy, or have very dark urine.`
  },
  {
    keywords: ['breathing', 'breath', 'asthma', 'shortness of breath', 'wheezing', 'breathless'],
    response: `🫁 **Breathing & Respiratory Tips:**\n\n• Sit upright to help expand your lungs.\n• Practice pursed-lip breathing: inhale through nose, exhale slowly through pursed lips.\n• Avoid smoke, dust, and strong perfumes.\n• If you have asthma, always keep your inhaler nearby.\n• Use a humidifier if indoor air is very dry.\n• Stay away from known triggers.\n\n🚨 **Seek emergency help if:** you have sudden severe breathlessness, blue lips, or can't complete sentences due to breathlessness.`
  },
  {
    keywords: ['eye', 'vision', 'blurry', 'eye pain', 'red eye', 'eye strain'],
    response: `👁️ **Eye Health Tips:**\n\n• Follow the 20-20-20 rule: every 20 min, look at something 20 feet away for 20 seconds.\n• Keep screens at arm's length and slightly below eye level.\n• Blink often to keep eyes moist, especially at screens.\n• Wear sunglasses to protect from UV rays outdoors.\n• Eat eye-healthy foods: carrots, leafy greens, fish.\n• Ensure good lighting when reading or working.\n\n⚠️ **See a doctor if:** you have sudden vision changes, eye pain, flashes of light, or persistent redness.`
  },
  {
    keywords: ['depression', 'sad', 'hopeless', 'lonely', 'depressed', 'unmotivated', 'mood'],
    response: `💙 **Mental Health & Depression Support:**\n\n• Talk to someone you trust — a friend, family member, or counselor.\n• Maintain a daily routine, even small routines help.\n• Get outside and get some sunlight every day.\n• Exercise — even a short walk can improve your mood.\n• Limit alcohol and avoid isolation.\n• Practice gratitude — write down 3 things you're grateful for each day.\n\n⚠️ **If you're in crisis:** Please reach out to a mental health professional or call a helpline. You are not alone, and help is available. 💛`
  },
  {
    keywords: ['dental', 'tooth', 'toothache', 'gum', 'teeth'],
    response: `🦷 **Dental Health Tips:**\n\n• Brush teeth twice daily for at least 2 minutes.\n• Floss daily to remove plaque between teeth.\n• Rinse with warm salt water for gum pain or minor toothache.\n• Avoid very hot, cold, or sugary foods if teeth are sensitive.\n• Visit a dentist every 6 months for check-ups.\n\n⚠️ **See a dentist if:** you have severe tooth pain, swelling, or bleeding gums that don't stop.`
  },
  {
    keywords: ['constipation', 'bloating', 'gas', 'bowel', 'hard stool'],
    response: `🍎 **Constipation & Bloating Relief:**\n\n• Eat high-fiber foods: fruits, vegetables, whole grains, beans.\n• Drink plenty of water — at least 8 glasses a day.\n• Exercise regularly — walking helps stimulate bowel movements.\n• Don't ignore the urge to go to the bathroom.\n• Try warm water with lemon in the morning.\n• Reduce processed foods and excessive dairy.\n\n⚠️ **See a doctor if:** constipation lasts more than 2 weeks, or comes with blood in stool or severe pain.`
  },
];

// ── 🚨 Crisis & Safety KB (HIGHEST PRIORITY) ──────────
const crisisKB = [
  {
    keywords: ['want to die', 'wanna die', 'kill myself', 'suicide', 'suicidal', 'end my life', 'end it all', 'not worth living', 'better off dead', 'no reason to live', 'take my own life'],
    response: `🚨 **I hear you, and I'm so sorry you're feeling this way. Your pain is real, and you matter deeply.**\n\nPlease know that you are NOT alone — people care about you, and help is available right now:\n\n📞 **Crisis Helplines (24/7):**\n• 🇮🇳 **iCall:** 9152987821\n• 🇮🇳 **Vandrevala Foundation:** 1860-2662-345\n• 🇺🇸 **988 Suicide & Crisis Lifeline:** Call or text **988**\n• 🌍 **International:** befrienders.org/need-to-talk\n\n💙 Please reach out to a family member, friend, caregiver, or doctor. You deserve support and kindness. You are loved. 💛\n\n⚠️ If you are in immediate danger, please call emergency services (112 / 911) right away.`
  },
  {
    keywords: ['self harm', 'self-harm', 'hurt myself', 'cutting myself', 'harming myself', 'punish myself'],
    response: `💙 **I'm really concerned about you, and I want you to know that your feelings are valid.**\n\nHurting yourself is not the answer — you deserve care and compassion, not pain.\n\n📞 **Please reach out now:**\n• 🇮🇳 **iCall:** 9152987821\n• 🇮🇳 **Vandrevala Foundation:** 1860-2662-345\n• 🇺🇸 **988 Lifeline:** Call or text **988**\n\n• Try holding ice cubes, snapping a rubber band, or doing intense exercise as safer alternatives.\n• Talk to someone you trust — a friend, family member, or counselor.\n• You are worthy of help and healing. 💛`
  },
  {
    keywords: ['no hope', 'hopeless', 'give up', 'giving up', 'cant go on', 'cant take it anymore', 'cant do this anymore', 'i give up', 'whats the point', 'no point', 'pointless'],
    response: `💙 **I hear you. When everything feels heavy and pointless, even getting through the day takes incredible strength — and you're still here. That matters.**\n\n• It's okay to feel this way — you don't have to pretend to be fine.\n• These feelings are temporary, even when they don't feel like it.\n• Please talk to someone — a friend, family member, or counselor.\n\n📞 **Helplines:**\n• 🇮🇳 iCall: 9152987821 | Vandrevala: 1860-2662-345\n• 🇺🇸 988 Lifeline: Call/text 988\n\nYou are stronger than you think, and you don't have to face this alone. 💛`
  },
  {
    keywords: ['want to disappear', 'nobody cares', 'no one cares', 'nobody loves me', 'no one loves me', 'burden', 'i am a burden', 'worthless', 'useless', 'i am nothing'],
    response: `💙 **That is not true — you are NOT a burden and you are NOT worthless. Depression lies to us and makes us believe things that aren't real.**\n\n• The people in your life care, even when it doesn't feel like it.\n• You have value simply by being you — you don't need to "earn" love.\n• Please talk to someone about how you're feeling.\n\n📞 **Helplines:**\n• 🇮🇳 iCall: 9152987821 | Vandrevala: 1860-2662-345\n• 🇺🇸 988 Lifeline: Call/text 988\n\nYou are loved. You are enough. 💛`
  },
];

// ── 💙 Emotional & Life Support KB ─────────────────────
const emotionalKB = [
  {
    keywords: ['lonely', 'alone', 'no friends', 'isolated', 'loneliness', 'feel alone', 'all alone'],
    response: `💙 **Loneliness can feel overwhelming, but you're reaching out — and that takes courage.**\n\n• Try calling or messaging someone you trust, even a short chat can help.\n• Join a local community group, temple, church, or club.\n• Volunteering helps you connect with others and feel valued.\n• Take a walk outside — being around people, even strangers, helps.\n• Consider joining a caregiver or patient support group.\n\n🤗 **Remember:** being alone and being lonely are different things. It's okay to ask for company. You matter to more people than you realize.`
  },
  {
    keywords: ['angry', 'frustrated', 'furious', 'rage', 'irritated', 'annoyed', 'mad', 'hate everything'],
    response: `😤 **Anger is a natural emotion — it's okay to feel this way. What matters is how we handle it.**\n\n• Take 10 slow, deep breaths before reacting.\n• Remove yourself from the situation for a few minutes.\n• Write down what made you angry — it helps process the emotion.\n• Physical activity (walk, exercise, even cleaning) helps release tension.\n• Talk to someone about what's bothering you.\n\n💡 **Tip:** Anger often masks deeper feelings — hurt, fear, or helplessness. It's okay to explore what's underneath. 💙`
  },
  {
    keywords: ['scared', 'afraid', 'fear', 'terrified', 'frightened', 'phobia', 'nightmares'],
    response: `🫂 **It's completely okay to feel scared — fear is your mind trying to protect you.**\n\n• Name your fear out loud: "I am scared of ___." This reduces its power.\n• Practice deep breathing: inhale 4 sec → hold 4 → exhale 6 sec.\n• Ground yourself: focus on 5 things you can see, 4 you can touch, 3 you hear.\n• Talk to someone you trust about what frightens you.\n• Remember: bravery isn't the absence of fear — it's acting despite it.\n\n💙 You don't have to face your fears alone. Reach out to a friend, family member, or counselor.`
  },
  {
    keywords: ['crying', 'i cried', 'cant stop crying', 'keep crying', 'tears', 'so sad', 'breaking down', 'fell apart'],
    response: `💙 **Crying is not weakness — it's your heart's way of healing. Let it out.**\n\n• It's okay to cry. Give yourself permission to feel.\n• After crying, drink some water and take slow breaths.\n• Wrap yourself in something warm — a blanket, a hug.\n• Write down what's making you cry. Sometimes seeing it on paper helps.\n• Talk to someone — you don't have to explain everything, just say "I need support."\n\n🤗 You are brave for feeling deeply. Tomorrow can be a better day. 💛`
  },
  {
    keywords: ['confused', 'lost', 'dont know what to do', 'stuck', 'overwhelmed', 'too much', 'cant think', 'brain fog'],
    response: `🌀 **It's okay to feel lost or overwhelmed — it means you care enough to want things to be better.**\n\n• Pause and breathe. You don't have to solve everything right now.\n• Write down one small thing you CAN do today — just one.\n• Talk to someone you trust — a fresh perspective can help.\n• Break big problems into tiny steps.\n• For memory/brain fog: stay hydrated, rest, and try a short walk.\n\n💙 **Remember:** clarity comes from rest, not from overthinking. Be gentle with yourself. 🌿`
  },
  {
    keywords: ['miss someone', 'lost someone', 'grief', 'grieving', 'passed away', 'died', 'death of', 'missing them', 'gone forever'],
    response: `🕊️ **I'm so sorry for your loss. Grief is one of the hardest things a person can go through.**\n\n• There's no "right" way to grieve — let yourself feel whatever comes.\n• Cherish the memories — looking at photos or sharing stories can help.\n• Don't isolate yourself — let people support you.\n• Eat, sleep, and take care of your body even when it feels hard.\n• Consider joining a grief support group.\n\n💙 **Remember:** grieving is not a sign of weakness. It's the price of love, and it shows how deeply you cared. The love never goes away. 💛`
  },
  {
    keywords: ['caregiver burnout', 'tired of caring', 'caregiver stress', 'too much pressure', 'exhausted caregiver', 'taking care of someone'],
    response: `💜 **Being a caregiver is one of the most selfless and exhausting roles. You are doing an incredible job.**\n\n• You cannot pour from an empty cup — self-care is NOT selfish.\n• Take small breaks throughout the day, even 10 minutes.\n• Ask for help — delegate tasks to family or friends.\n• Join a caregiver support group (online or local).\n• Make sure YOU are eating, sleeping, and getting fresh air.\n\n📞 **Caregiver resources:**\n• 🇮🇳 Alzheimer's & Related Disorders Society of India (ARDSI)\n• 🇺🇸 Caregiver Action Network: 1-855-227-3640\n\n💙 You are a hero. But even heroes need rest. 💛`
  },
];

// ── 💬 General / Motivational / Life KB ────────────────
const generalKB = [
  {
    keywords: ['meaning of life', 'purpose of life', 'why do we live', 'what is life', 'reason to live'],
    response: `🌟 **That's one of life's deepest questions — and there's no single "right" answer.**\n\n• Some find meaning in love and relationships.\n• Others find it in helping people, creating art, or learning.\n• For many, meaning comes from small moments — a sunrise, a child's laugh, a warm cup of tea.\n\n💡 **A beautiful thought:** "The meaning of life is to find your gift. The purpose of life is to give it away." — Pablo Picasso\n\n💙 The fact that you're asking this question means you care deeply. That itself is beautiful.`
  },
  {
    keywords: ['motivate me', 'motivation', 'inspire me', 'i need strength', 'keep going', 'dont give up', 'encourage'],
    response: `🔥 **You've survived 100% of your worst days. That's an incredible track record.**\n\n• Progress is not always visible — but every small step counts.\n• It's okay to rest, but never quit.\n• Surround yourself with people who believe in you.\n• Celebrate small wins — they add up to big victories.\n\n💬 **"You are braver than you believe, stronger than you seem, and smarter than you think."** — A.A. Milne\n\n💙 Keep going. The world is better with you in it. 🌟`
  },
  {
    keywords: ['tell me a joke', 'joke', 'make me laugh', 'funny', 'cheer me up'],
    response: `😄 Here's one for you:\n\n**Why did the doctor carry a red pen?** 🖊️\nIn case they needed to draw blood! 😂\n\n**And another:**\nPatient: "Doctor, I feel like a pair of curtains."\nDoctor: "Pull yourself together!" 🤣\n\n💙 I hope that brought a little smile! Laughter really is the best medicine. 😊`
  },
  {
    keywords: ['bored', 'nothing to do', 'boring', 'entertain me', 'what should i do'],
    response: `🎯 **Here are some fun ideas to brighten your day:**\n\n• 🧩 Try the cognitive games in this app — they're fun AND good for your brain!\n• 📚 Read a short story or listen to an audiobook.\n• 🎵 Put on your favorite music and sing along.\n• 🌿 Go for a short walk outside — fresh air works wonders.\n• 📝 Write a letter to someone you love.\n• 🧘 Try a 5-minute guided meditation.\n\n💙 Sometimes the best thing to do is something small that makes you smile. 😊`
  },
  {
    keywords: ['who are you', 'what are you', 'your name', 'what can you do', 'tell me about yourself'],
    response: `🤖 **I'm MedBot — your friendly wellness companion!**\n\n• I can help with health questions, symptoms, and lifestyle tips.\n• I'm here for emotional support when you're feeling down.\n• I can chat about life, share motivation, or even tell jokes!\n• I help you stay on track with your medicine reminders.\n\n💙 Think of me as a caring friend who's always here. I may not have all the answers, but I'll always listen and do my best to help! 😊`
  },
  {
    keywords: ['is it wrong', 'is it okay', 'am i bad', 'feel guilty', 'guilt', 'ashamed', 'shame', 'am i wrong'],
    response: `💙 **Feeling guilty or questioning yourself shows you have a good heart.**\n\n• Everyone makes mistakes — it's part of being human.\n• What matters is that you recognize your feelings and want to do better.\n• Forgive yourself the same way you'd forgive a friend.\n• If something is truly bothering you, talk to someone you trust.\n\n🌿 **Remember:** you are not defined by your worst moments. You are capable of growth, change, and kindness — especially towards yourself. 💛`
  },
  {
    keywords: ['love', 'heartbreak', 'breakup', 'broken heart', 'relationship', 'miss my partner', 'miss him', 'miss her', 'ex'],
    response: `💔 **Heartbreak is one of the most painful human experiences — and it's okay to grieve a relationship.**\n\n• Let yourself feel the pain — suppressing it only delays healing.\n• Lean on friends and family for support.\n• Focus on self-care: eat well, sleep well, move your body.\n• Avoid making big decisions while emotions are raw.\n• Time really does help — it won't feel this intense forever.\n\n💙 **"The wound is the place where the Light enters you."** — Rumi\n\nYou will love again. You will smile again. Give yourself time. 💛`
  },
  {
    keywords: ['good morning', 'good night', 'good afternoon', 'good evening'],
    response: `☀️ **Hello there! I hope you're having a wonderful day!**\n\n• Remember to drink some water 💧\n• Take your medicines on time 💊\n• Smile — you're doing great! 😊\n\n💙 What can I help you with today?`
  },
  {
    keywords: ['how are you', 'how r u', 'how are u', 'hows it going', 'whats up'],
    response: `😊 **I'm doing great, thank you for asking! That's really kind of you.**\n\nMore importantly — how are **you** feeling today? I'm here if you want to talk about anything — health, feelings, or just for a chat! 💙`
  },
];

// ── Greeting patterns ────────────────
const greetings = ['hi', 'hello', 'hey', 'howdy', 'sup', 'hola'];
const thanks = ['thank', 'thanks', 'thankyou', 'thank you', 'appreciate', 'helpful'];
const byes = ['bye', 'goodbye', 'see you', 'take care', 'later'];

/**
 * Score a message against a knowledge base array.
 */
function scoreKB(msg, kb) {
  let bestMatch = null;
  let bestScore = 0;
  for (const entry of kb) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (msg.includes(keyword)) {
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }
  return { match: bestMatch, score: bestScore };
}

/**
 * Find the best matching response.
 * Priority order: Crisis → Emotional → Medical → General → Fallback
 */
function findResponse(userMessage) {
  const msg = userMessage.toLowerCase().trim();

  // 🚨 HIGHEST PRIORITY — Crisis detection (always check first)
  const crisis = scoreKB(msg, crisisKB);
  if (crisis.score > 0) return crisis.match.response;

  // Check greetings
  if (greetings.some(g => msg === g || msg.startsWith(g + ' ') || msg.startsWith(g + '!'))) {
    return "👋 Hello! I'm **MedBot**, your wellness companion. Ask me about health, how you're feeling, life advice, or just chat. I'm here for you! 💙";
  }

  // Check thanks
  if (thanks.some(t => msg.includes(t))) {
    return "😊 You're welcome! I'm happy to help. Feel free to ask me anything — health, feelings, or just a friendly chat. Take care! 💙";
  }

  // Check goodbyes
  if (byes.some(b => msg.includes(b))) {
    return "👋 Goodbye! Take care of yourself. Remember to take your medicines on time and stay healthy! See you soon. 💊💙";
  }

  // 💙 Emotional support (check before medical to prioritize feelings)
  const emotional = scoreKB(msg, emotionalKB);

  // 🏥 Medical knowledge
  const medical = scoreKB(msg, medicalKB);

  // 💬 General conversation
  const general = scoreKB(msg, generalKB);

  // Return the highest-scoring match across all KBs
  const best = [emotional, medical, general].reduce((a, b) => b.score > a.score ? b : a);
  if (best.score > 0) return best.match.response;

  // Fallback — no match
  return `🤗 I'm here for you! I can help with many things:\n\n• 🏥 **Health questions** — headache, fever, diabetes, BP, sleep issues\n• 💙 **Emotional support** — feeling sad, lonely, anxious, overwhelmed\n• 🚨 **Crisis support** — if you're in distress, I'll connect you with help\n• 💬 **Life & chat** — motivation, advice, jokes, or just a friendly conversation\n\n💡 Try saying something like **"I feel anxious"**, **"tell me a joke"**, **"I have a headache"**, or **"I need motivation"**.\n\n⚠️ For serious symptoms, always consult a healthcare professional.`;
}


/* ── MedBot Component ────────────────────────────────── */
export default function MedBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "👋 Hi! I'm **MedBot**, your health wellness assistant. Ask me about symptoms, lifestyle tips, or when to see a doctor. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Don't render if user is not logged in
  if (!user) return null;

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setIsTyping(true);

    // Simulate a short "thinking" delay for natural feel
    setTimeout(() => {
      const reply = findResponse(trimmed);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Simple markdown bold rendering
  const renderText = (text) => {
    // Split into lines first, then handle bold within each line
    return text.split('\n').map((line, lineIdx) => (
      <span key={lineIdx}>
        {lineIdx > 0 && <br />}
        {line.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </span>
    ));
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        id="medbot-toggle"
        className={`medbot-fab ${isOpen ? 'medbot-fab-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with MedBot"
      >
        {isOpen ? (
          <span className="medbot-fab-icon">✕</span>
        ) : (
          <>
            <span className="medbot-fab-icon">🤖</span>
            <span className="medbot-fab-label">MedBot</span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="medbot-window" id="medbot-chat-window">
          {/* Header */}
          <div className="medbot-header">
            <div className="medbot-header-left">
              <div className="medbot-avatar">🤖</div>
              <div>
                <div className="medbot-title">MedBot</div>
                <div className="medbot-subtitle">AI Health Assistant</div>
              </div>
            </div>
            <button
              className="medbot-close"
              onClick={() => setIsOpen(false)}
              title="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="medbot-messages" id="medbot-messages-area">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`medbot-msg ${msg.role === 'user' ? 'medbot-msg-user' : 'medbot-msg-bot'}`}
              >
                {msg.role === 'bot' && <span className="medbot-msg-avatar">🤖</span>}
                <div className={`medbot-msg-bubble ${msg.role === 'user' ? 'medbot-bubble-user' : 'medbot-bubble-bot'}`}>
                  {renderText(msg.text)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="medbot-msg medbot-msg-bot">
                <span className="medbot-msg-avatar">🤖</span>
                <div className="medbot-bubble-bot medbot-typing">
                  <span className="medbot-dot"></span>
                  <span className="medbot-dot"></span>
                  <span className="medbot-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="medbot-input-area">
            <input
              ref={inputRef}
              id="medbot-input"
              type="text"
              className="medbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about symptoms, tips..."
              disabled={isTyping}
              autoComplete="off"
            />
            <button
              id="medbot-send"
              className="medbot-send"
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              title="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
