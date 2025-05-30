export interface MTGRule {
  number: string
  title: string
  content: string
  examples?: string[]
  category: string
  subcategory?: string
  keywords?: string[]
}

export interface RuleCategory {
  id: string
  name: string
  description: string
  subcategories?: string[]
}

export const ruleCategories: RuleCategory[] = [
  {
    id: "1",
    name: "Game Concepts",
    description: "Basic game concepts and terminology",
    subcategories: ["General", "Players", "Starting the Game", "Ending the Game"],
  },
  {
    id: "2",
    name: "Parts of a Card",
    description: "Card components and characteristics",
    subcategories: ["Name", "Mana Cost", "Color", "Type Line", "Text Box", "Power/Toughness"],
  },
  {
    id: "3",
    name: "Card Types",
    description: "Different types of Magic cards",
    subcategories: ["Artifacts", "Creatures", "Enchantments", "Instants", "Lands", "Planeswalkers", "Sorceries"],
  },
  {
    id: "4",
    name: "Zones",
    description: "Game zones where cards exist",
    subcategories: ["Library", "Hand", "Battlefield", "Graveyard", "Stack", "Exile", "Command"],
  },
  {
    id: "5",
    name: "Turn Structure",
    description: "How turns and phases work",
    subcategories: ["Beginning Phase", "Main Phase", "Combat Phase", "Ending Phase"],
  },
  {
    id: "6",
    name: "Spells, Abilities, and Effects",
    description: "How spells and abilities work",
    subcategories: ["Casting Spells", "Activated Abilities", "Triggered Abilities", "Static Abilities"],
  },
  {
    id: "7",
    name: "Additional Rules",
    description: "Advanced game mechanics",
    subcategories: ["State-Based Actions", "Replacement Effects", "Prevention Effects"],
  },
  {
    id: "8",
    name: "Multiplayer Rules",
    description: "Rules for games with more than two players",
  },
  {
    id: "9",
    name: "Casual Variants",
    description: "Alternative ways to play Magic",
  },
]

// Comprehensive MTG rules dataset (this would be the full comprehensive rules in production)
export const comprehensiveRules: MTGRule[] = [
  // Section 1: Game Concepts
  {
    number: "100.1",
    title: "General",
    content:
      "These Magic rules apply to any Magic game with two or more players, including two-player games and multiplayer games.",
    category: "Game Concepts",
    subcategory: "General",
    keywords: ["game", "players", "multiplayer"],
    examples: ["A game between two players", "A multiplayer game with four players"],
  },
  {
    number: "100.2",
    title: "General",
    content:
      "To play, each player needs their own deck of traditional Magic cards, small items to represent any tokens and counters, and some way to clearly track life totals.",
    category: "Game Concepts",
    subcategory: "General",
    keywords: ["deck", "tokens", "counters", "life"],
    examples: ["60-card constructed deck", "Dice for tracking life totals"],
  },
  {
    number: "101.1",
    title: "Starting the Game",
    content:
      "At the start of a game, each player shuffles their deck so that the cards are in a random order. Each player's deck becomes their library.",
    category: "Game Concepts",
    subcategory: "Starting the Game",
    keywords: ["shuffle", "deck", "library", "random"],
    examples: ["Shuffle your deck before drawing opening hands"],
  },
  {
    number: "101.2",
    title: "Starting the Game",
    content:
      "After the decks are shuffled, the players determine which player goes first. In the first game of a match, the players may use any mutually agreeable method.",
    category: "Game Concepts",
    subcategory: "Starting the Game",
    keywords: ["first player", "turn order"],
    examples: ["Rolling dice to determine who goes first", "Rock-paper-scissors"],
  },
  {
    number: "101.3",
    title: "Starting the Game",
    content:
      "Each player begins the game with a starting life total of 20. Some variant games have different starting life totals.",
    category: "Game Concepts",
    subcategory: "Starting the Game",
    keywords: ["life total", "starting life", "20 life"],
    examples: ["Standard games start at 20 life", "Commander games start at 40 life"],
  },

  // Section 2: Parts of a Card
  {
    number: "200.1",
    title: "General",
    content:
      "The parts of a card are name, mana cost, color indicator, type line, expansion symbol, text box, power and toughness, loyalty, hand modifier, and life modifier.",
    category: "Parts of a Card",
    keywords: ["card parts", "name", "mana cost", "type line", "text box"],
    examples: ["Lightning Bolt has name, mana cost, type line, and text box"],
  },
  {
    number: "202.1",
    title: "Name",
    content: "The name of a card is printed on its upper left corner.",
    category: "Parts of a Card",
    subcategory: "Name",
    keywords: ["card name", "upper left"],
    examples: ["'Lightning Bolt' appears in the upper left corner"],
  },
  {
    number: "202.2",
    title: "Name",
    content:
      "A card's name is always considered to be the English version of its name, regardless of printed language.",
    category: "Parts of a Card",
    subcategory: "Name",
    keywords: ["English name", "language"],
    examples: ["A Japanese Lightning Bolt is still named 'Lightning Bolt'"],
  },

  // Section 3: Card Types
  {
    number: "300.1",
    title: "General",
    content: "The card types are artifact, creature, enchantment, instant, land, planeswalker, and sorcery.",
    category: "Card Types",
    keywords: ["card types", "artifact", "creature", "enchantment", "instant", "land", "planeswalker", "sorcery"],
    examples: ["Lightning Bolt is an instant", "Forest is a land"],
  },
  {
    number: "301.1",
    title: "Artifacts",
    content:
      "A player who has priority may cast an artifact card from their hand during a main phase of their turn when the stack is empty.",
    category: "Card Types",
    subcategory: "Artifacts",
    keywords: ["artifact", "main phase", "priority", "stack"],
    examples: ["Sol Ring can be cast during your main phase"],
  },
  {
    number: "302.1",
    title: "Creatures",
    content:
      "A player who has priority may cast a creature card from their hand during a main phase of their turn when the stack is empty.",
    category: "Card Types",
    subcategory: "Creatures",
    keywords: ["creature", "main phase", "priority", "stack"],
    examples: ["Lightning Bolt can be cast during any phase"],
  },

  // Section 4: Zones
  {
    number: "400.1",
    title: "General",
    content:
      "A zone is a place where objects can be during a game. There are normally seven zones: library, hand, battlefield, graveyard, stack, exile, and command.",
    category: "Zones",
    keywords: ["zones", "library", "hand", "battlefield", "graveyard", "stack", "exile", "command"],
    examples: ["Cards in your hand are in the hand zone", "Permanents are on the battlefield"],
  },
  {
    number: "401.1",
    title: "Library",
    content: "When a game begins, each player's deck becomes their library.",
    category: "Zones",
    subcategory: "Library",
    keywords: ["library", "deck"],
    examples: ["Your 60-card deck becomes your library at game start"],
  },
  {
    number: "402.1",
    title: "Hand",
    content: "The hand is where a player holds cards that have been drawn but not yet played.",
    category: "Zones",
    subcategory: "Hand",
    keywords: ["hand", "drawn cards"],
    examples: ["Your opening hand of 7 cards"],
  },

  // Section 5: Turn Structure
  {
    number: "500.1",
    title: "General",
    content:
      "A turn consists of five phases, in this order: beginning, precombat main, combat, postcombat main, and ending.",
    category: "Turn Structure",
    keywords: ["turn", "phases", "beginning", "main", "combat", "ending"],
    examples: ["Untap, upkeep, draw, main, combat, main, end, cleanup"],
  },
  {
    number: "501.1",
    title: "Beginning Phase",
    content: "The beginning phase consists of three steps, in this order: untap, upkeep, and draw.",
    category: "Turn Structure",
    subcategory: "Beginning Phase",
    keywords: ["beginning phase", "untap", "upkeep", "draw"],
    examples: ["Untap all your permanents, then upkeep triggers, then draw a card"],
  },
  {
    number: "505.1",
    title: "Main Phase",
    content:
      "A player who has priority may cast spells, activate abilities, and take special actions during their main phase.",
    category: "Turn Structure",
    subcategory: "Main Phase",
    keywords: ["main phase", "cast spells", "activate abilities", "priority"],
    examples: ["Cast creatures and sorceries during your main phase"],
  },

  // Section 6: Spells, Abilities, and Effects
  {
    number: "601.1",
    title: "Casting Spells",
    content:
      "Previously, the action of casting a spell, or casting a card as a spell, was referred to on cards as 'playing' that spell or that card.",
    category: "Spells, Abilities, and Effects",
    subcategory: "Casting Spells",
    keywords: ["casting", "spells", "playing"],
    examples: ["You cast Lightning Bolt, you don't play it"],
  },
  {
    number: "602.1",
    title: "Activated Abilities",
    content: "Activated abilities have a cost and an effect. They are written as '[Cost]: [Effect].'",
    category: "Spells, Abilities, and Effects",
    subcategory: "Activated Abilities",
    keywords: ["activated abilities", "cost", "effect"],
    examples: ["{T}: Add one mana of any color", "{2}, {T}: Draw a card"],
  },
  {
    number: "603.1",
    title: "Triggered Abilities",
    content:
      "Triggered abilities have a trigger condition and an effect. They are written as '[Trigger condition], [effect],' and include the word 'when,' 'whenever,' or 'at.'",
    category: "Spells, Abilities, and Effects",
    subcategory: "Triggered Abilities",
    keywords: ["triggered abilities", "when", "whenever", "at"],
    examples: ["When this creature enters the battlefield, draw a card", "Whenever you cast a spell, deal 1 damage"],
  },

  // Section 7: Additional Rules
  {
    number: "704.1",
    title: "State-Based Actions",
    content: "State-based actions are game actions that happen automatically whenever certain conditions are met.",
    category: "Additional Rules",
    subcategory: "State-Based Actions",
    keywords: ["state-based actions", "automatic", "conditions"],
    examples: ["A creature with 0 toughness dies", "A player with 0 life loses"],
  },
  {
    number: "704.3",
    title: "State-Based Actions",
    content:
      "Whenever a player would get priority, the game checks for and resolves all applicable state-based actions simultaneously as a single event.",
    category: "Additional Rules",
    subcategory: "State-Based Actions",
    keywords: ["priority", "simultaneous", "single event"],
    examples: ["Multiple creatures dying at once from damage"],
  },
  {
    number: "614.1",
    title: "Replacement Effects",
    content:
      "Some continuous effects are replacement effects. Like prevention effects, replacement effects apply continuously as events happen—they aren't cast or activated.",
    category: "Additional Rules",
    subcategory: "Replacement Effects",
    keywords: ["replacement effects", "continuous", "instead"],
    examples: ["If a card would be put into your graveyard, exile it instead"],
  },

  // Combat Rules
  {
    number: "506.1",
    title: "Combat Phase",
    content:
      "The combat phase has five steps, in this order: beginning of combat, declare attackers, declare blockers, combat damage, and end of combat.",
    category: "Turn Structure",
    subcategory: "Combat Phase",
    keywords: ["combat", "attackers", "blockers", "damage"],
    examples: ["Declare attackers, opponent declares blockers, then damage"],
  },
  {
    number: "508.1",
    title: "Declare Attackers Step",
    content: "First, the active player declares attackers. This turn-based action doesn't use the stack.",
    category: "Turn Structure",
    subcategory: "Combat Phase",
    keywords: ["declare attackers", "active player", "stack"],
    examples: ["Tap your creatures to attack"],
  },
  {
    number: "509.1",
    title: "Declare Blockers Step",
    content: "First, the defending player declares blockers. This turn-based action doesn't use the stack.",
    category: "Turn Structure",
    subcategory: "Combat Phase",
    keywords: ["declare blockers", "defending player"],
    examples: ["Block attacking creatures with your untapped creatures"],
  },

  // Priority and Stack
  {
    number: "117.1",
    title: "Timing and Priority",
    content:
      "Unless a spell or ability is instructing a player to take an action, which player can take actions at any given time is determined by a system of priority.",
    category: "Spells, Abilities, and Effects",
    keywords: ["priority", "timing", "actions"],
    examples: ["You have priority during your main phase", "Pass priority to let spells resolve"],
  },
  {
    number: "405.1",
    title: "Stack",
    content:
      "When a spell is cast, the physical card is put on the stack. When an ability is activated or triggers, it goes on top of the stack without any card associated with it.",
    category: "Zones",
    subcategory: "Stack",
    keywords: ["stack", "spells", "abilities", "LIFO"],
    examples: ["Last spell cast resolves first", "Abilities go on the stack above spells"],
  },

  // Mana and Costs
  {
    number: "106.1",
    title: "Mana",
    content:
      "Mana is the primary resource in the game. Players spend mana to cast spells, activate abilities, and pay costs.",
    category: "Game Concepts",
    keywords: ["mana", "resource", "costs"],
    examples: ["Tap a Forest to add green mana", "Pay 3 mana to cast a spell"],
  },
  {
    number: "107.1",
    title: "Numbers and Symbols",
    content:
      "The Magic game uses only integers. You can't choose a fractional number, deal fractional damage, gain fractional life, and so on.",
    category: "Game Concepts",
    keywords: ["integers", "numbers", "fractional"],
    examples: ["You can't deal 1.5 damage", "Life totals are always whole numbers"],
  },

  // Keyword Abilities
  {
    number: "702.1",
    title: "Keyword Abilities",
    content:
      "Most abilities describe exactly what they do in the card's text box. Some, though, are very common or would require too much space to define on the card.",
    category: "Spells, Abilities, and Effects",
    keywords: ["keyword abilities", "common abilities"],
    examples: ["Flying", "Trample", "First strike", "Deathtouch"],
  },
  {
    number: "702.9",
    title: "Flying",
    content:
      "Flying is an evasion ability. A creature with flying can't be blocked except by creatures with flying and/or reach.",
    category: "Spells, Abilities, and Effects",
    keywords: ["flying", "evasion", "blocked", "reach"],
    examples: ["Dragons typically have flying", "Only creatures with flying or reach can block flyers"],
  },
  {
    number: "702.19",
    title: "Trample",
    content: "Trample is a static ability that modifies the rules for assigning an attacking creature's combat damage.",
    category: "Spells, Abilities, and Effects",
    keywords: ["trample", "combat damage", "excess damage"],
    examples: ["Excess damage tramples over to the defending player"],
  },
]
