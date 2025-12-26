
export interface Peche {
    id: string;
    text: string;
}

export interface Commandement {
    numero: number;
    titre: string;
    description: string;
    peches: Peche[];
}

export const commandements: Commandement[] = [
    {
        numero: 1,
        titre: "Tu adoreras le Seigneur ton Dieu",
        description: "Premier commandement : Tu n'auras pas d'autres dieux devant ma face.",
        peches: [
            { id: "1_1", text: "Ai-je mis Dieu à la première place dans ma vie ?" },
            { id: "1_2", text: "Ai-je négligé ma prière quotidienne ?" },
            { id: "1_3", text: "Ai-je douté de la miséricorde ou de la puissance de Dieu ?" },
            { id: "1_4", text: "Me suis-je tourné vers la superstition, l'occultisme ou l'horoscope ?" },
            { id: "1_5", text: "Ai-je reçu la Sainte Communion en état de péché mortel ?" },
            { id: "1_6", text: "Ai-je manqué de respect envers les choses saintes ?" }
        ]
    },
    {
        numero: 2,
        titre: "Tu ne prononceras pas le nom de Dieu en vain",
        description: "Deuxième commandement : Le respect du Nom de Dieu.",
        peches: [
            { id: "2_1", text: "Ai-je utilisé le nom de Dieu sans respect, sous le coup de la colère ou pour plaisanter ?" },
            { id: "2_2", text: "Ai-je juré faussement en prenant Dieu à témoin ?" },
            { id: "2_3", text: "Ai-je manqué à une promesse faite à Dieu ?" },
            { id: "2_4", text: "Ai-je blasphémé ?" }
        ]
    },
    {
        numero: 3,
        titre: "Tu sanctifieras le jour du Seigneur",
        description: "Troisième commandement : L'obligation de la messe et du repos dominical.",
        peches: [
            { id: "3_1", text: "Ai-je manqué la messe le dimanche ou les jours d'obligation sans motif grave ?" },
            { id: "3_2", text: "Suis-je arrivé en retard à la messe par négligence ?" },
            { id: "3_3", text: "Ai-je travaillé inutilement le dimanche, négligeant le temps pour Dieu et la famille ?" },
            { id: "3_4", text: "Ai-je gêné les autres dans l'observation du dimanche ?" }
        ]
    },
    {
        numero: 4,
        titre: "Tu honoreras ton père et ta mère",
        description: "Quatrième commandement : Les devoirs envers la famille et l'autorité.",
        peches: [
            { id: "4_1", text: "Ai-je manqué de respect ou d'obéissance envers mes parents ?" },
            { id: "4_2", text: "Ai-je négligé d'aider mes parents dans leurs besoins ?" },
            { id: "4_3", text: "Ai-je été source de conflit ou de peine dans ma famille ?" },
            { id: "4_4", text: "Comme parent, ai-je négligé l'éducation chrétienne de mes enfants ?" },
            { id: "4_5", text: "Ai-je manqué de respect envers l'autorité légitime ?" }
        ]
    },
    {
        numero: 5,
        titre: "Tu ne tueras point",
        description: "Cinquième commandement : Le respect de la vie humaine et de la dignité.",
        peches: [
            { id: "5_1", text: "Ai-je souhaité du mal à autrui ?" },
            { id: "5_2", text: "Me suis-je laissé emporter par la colère, la haine ou le désir de vengeance ?" },
            { id: "5_3", text: "Ai-je nui à ma santé ou à ma vie (drogue, alcool, excès) ?" },
            { id: "5_4", text: "Ai-je encouragé ou participé à l'avortement ou à l'euthanasie ?" },
            { id: "5_5", text: "Ai-je détruit la réputation de quelqu'un par des médisances ?" }
        ]
    },
    {
        numero: 6,
        titre: "Tu ne commettras pas d'acte impur",
        description: "Sixième commandement : La pureté et la chasteté.",
        peches: [
            { id: "6_1", text: "Ai-je entretenu des pensées ou désirs impurs volontaires ?" },
            { id: "6_2", text: "Ai-je regardé de la pornographie ou des images indécentes ?" },
            { id: "6_3", text: "Ai-je commis des actes impurs seul ou avec d'autres ?" },
            { id: "6_4", text: "Ai-je manqué de modestie dans ma tenue ou mon comportement ?" }
        ]
    },
    {
        numero: 7,
        titre: "Tu ne voleras pas",
        description: "Septième commandement : La justice et le respect des biens d'autrui.",
        peches: [
            { id: "7_1", text: "Ai-je pris quelque chose qui ne m'appartenait pas ?" },
            { id: "7_2", text: "Ai-je triché (examens, impôts, affaires) ?" },
            { id: "7_3", text: "Ai-je tardé à rendre ce que j'ai emprunté ?" },
            { id: "7_4", text: "Ai-je gaspillé mes biens ou ceux des autres ?" },
            { id: "7_5", text: "Ai-je refusé d'aider les pauvres selon mes moyens ?" }
        ]
    },
    {
        numero: 8,
        titre: "Tu ne mentiras pas",
        description: "Huitième commandement : La vérité et l'honnêteté.",
        peches: [
            { id: "8_1", text: "Ai-je menti ?" },
            { id: "8_2", text: "Ai-je calomnié ou porté de faux témoignages ?" },
            { id: "8_3", text: "Ai-je révélé des secrets sans raison valable ?" },
            { id: "8_4", text: "Ai-je été hypocrite ?" }
        ]
    },
    {
        numero: 9,
        titre: "Tu ne désireras pas la femme de ton prochain",
        description: "Neuvième commandement : La pureté du cœur.",
        peches: [
            { id: "9_1", text: "Ai-je consenti à des regards impurs ?" },
            { id: "9_2", text: "Ai-je laissé mon imagination divaguer vers des choses impures ?" },
            { id: "9_3", text: "Ne veille-je pas sur la pureté de mon cœur ?" }
        ]
    },
    {
        numero: 10,
        titre: "Tu ne désireras pas le bien d'autrui",
        description: "Dixième commandement : Le détachement des biens matériels.",
        peches: [
            { id: "10_1", text: "Ai-je été jaloux de ce que les autres possèdent ?" },
            { id: "10_2", text: "Ai-je été avare ou trop attaché à l'argent ?" },
            { id: "10_3", text: "Ai-je manqué de gratitude pour ce que j'ai ?" }
        ]
    }
];

export const priereEspritSaint = `
Viens, Esprit Saint, remplis le cœur de tes fidèles et allume en eux le feu de ton amour.
Envoie ton Esprit et tout sera créé, et tu renouvelleras la face de la terre.
Ô Dieu qui as instruit les cœurs de tes fidèles par la lumière du Saint-Esprit,
donne-nous de goûter, par ce même Esprit, ce qui est bien,
et de jouir sans cesse de ses divines consolations.
Par le Christ notre Seigneur. Amen.
`;

export const acteContrition = `
Mon Dieu, j'ai un très grand regret de t'avoir offensé
parce que tu es infiniment bon, infiniment aimable,
et que le péché te déplaît.
Je prends la ferme résolution, avec le secours de ta sainte grâce,
de ne plus t'offenser et de faire pénitence.
`;
