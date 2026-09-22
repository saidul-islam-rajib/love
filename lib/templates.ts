export interface TemplateContent {
    title: string;
    description: string;
    yesLabel: string;
    noLabel: string;
    successTitle: string;
    successMessage: string;
    successSubtext: string;
}

export interface TemplateDefinition {
    id: string;
    name: string;
    tagline: string;
    defaults: TemplateContent;
}

export const TEMPLATES: TemplateDefinition[] = [
    {
        id: "bloom",
        name: "Romantic Bloom",
        tagline: "Rose & gold, floating hearts, a playful runaway No button",
        defaults: {
            title: "ধুলোয় পূর্ণ, অক্সিজেনশূন্য এই শহরে তুমি কি আমার বেঁচে থাকার বিশুদ্ধ অক্সিজেন হবে? ❤️",
            description: "এনাটমি বা শারীরবিদ্যা নিয়ে আমার কখনই বিন্দুমাত্র আগ্রহ ছিল না, এখনও নেই। কিন্তু তুমি যে কি নজরকাঁড়া!!! চুম্বকের মত বারবার আমার এই সংযত দৃষ্টিকে আকর্ষণ করে তোমার লাবণ্য। আর আমিও কর্কট রোগগ্রস্ত এক উন্মাদের মত কাপতে কাপতে চলে আসি তোমার তীরে!!",
            yesLabel: "Yes 💖",
            noLabel: "No",
            successTitle: "She said YES! 💍",
            successMessage: "Forever starts now... ✨",
            successSubtext: "This is the happiest moment of my life!",
        },
    },
    {
        id: "classic",
        name: "Classic Elegance",
        tagline: "Ivory & gold, quiet and refined, no distractions",
        defaults: {
            title: "Will You Marry Me?",
            description: "From the first day we met, I knew my life would never be the same. You have given me a kind of love I never dared to hope for — patient, gentle, and completely mine. I don't want a life without you in it. Will you take my hand and walk into forever with me?",
            yesLabel: "I Do",
            noLabel: "Not Yet",
            successTitle: "She Said Yes.",
            successMessage: "Forever begins today.",
            successSubtext: "The happiest moment of my life, made official.",
        },
    },
    {
        id: "playful",
        name: "Playful Pop",
        tagline: "Bold candy gradient, big bouncy buttons, confetti everywhere",
        defaults: {
            title: "Hey you 👀 I've got a BIG question...",
            description: "Okay so, hear me out 😄 You're my favorite person, my best friend, my partner in every ridiculous plan I've ever had — and I really, really don't want to do life without you. So... wanna make it official? 🎉💍",
            yesLabel: "YESSS 🙌",
            noLabel: "Nope 🙈",
            successTitle: "SHE SAID YESSS!! 🎉🎉",
            successMessage: "LET'S GOOOO 🥳",
            successSubtext: "Best. Day. Ever. 💥",
        },
    },
];

export const DEFAULT_TEMPLATE_ID = "bloom";

export function getTemplate(id?: string): TemplateDefinition {
    return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
}
