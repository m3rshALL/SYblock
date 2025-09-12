import { Level, PathPoint, EnemyType, TowerType, BossConfig, SpecialMechanic, ResourceConfig, EnemyAbility, TowerAbility } from '../types/game'

// 🎮 **КОНФИГУРАЦИИ УРОВНЕЙ SMART YOU**

export const LEVEL_CONFIGS: Level[] = [
  // 🛡️ УРОВЕНЬ 1: "Wallet in Danger" - Основы защиты
  {
    id: 1,
    title: "Кошелек в опасности",
    description: "Защитите криптокошелек от базовых хакерских атак. Изучите основы Solidity.",
    difficulty: 'beginner',
    xpReward: 100,
    badge: "🛡️",
    theme: 'wallet',
    objectives: [
      "Создать базовый смарт-контракт",
      "Использовать переменные и функции",
      "Защитить кошелек от простых атак",
      "Выдержать 5 волн врагов"
    ],
    initialCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WalletProtection {
    // Добавьте код для защиты кошелька
}`,
    solution: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WalletProtection {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    function deposit() public payable {
        // Функция для пополнения кошелька
    }
    
    function getBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }
    
    function withdraw(uint256 amount) public onlyOwner {
        require(amount <= address(this).balance, "Insufficient funds");
        payable(owner).transfer(amount);
    }
}`,
    hints: [
      {
        id: "wallet-hint-1",
        condition: "no_constructor",
        title: "Конструктор отсутствует",
        content: "Добавьте constructor() для установки владельца контракта"
      },
      {
        id: "wallet-hint-2", 
        condition: "no_modifier",
        title: "Модификаторы защиты",
        content: "Создайте модификатор onlyOwner для защиты функций"
      },
      {
        id: "wallet-hint-3",
        condition: "no_payable",
        title: "Payable функции",
        content: "Функция deposit() должна быть payable для приема эфира"
      }
    ],
    validationRules: [
      {
        type: 'contains',
        value: 'address public owner',
        errorMessage: 'Добавьте переменную owner типа address'
      },
      {
        type: 'function_exists',
        value: 'constructor',
        errorMessage: 'Создайте конструктор для инициализации владельца'
      },
      {
        type: 'modifier_used',
        value: 'onlyOwner',
        errorMessage: 'Используйте модификатор onlyOwner для защиты'
      },
      {
        type: 'contains',
        value: 'payable',
        errorMessage: 'Функция deposit должна быть payable'
      }
    ],
    enemyTypes: ['basic_hacker'],
    towerTypes: ['firewall'],
    mapLayout: [
      { x: 50, y: 250 },
      { x: 200, y: 250 },
      { x: 400, y: 250 },
      { x: 600, y: 250 },
      { x: 750, y: 250 }
    ],
    specialMechanics: [
      {
        id: 'basic_defense',
        type: 'resource_management',
        config: { startingGas: 100 }
      }
    ],
    resources: {
      gas: { initial: 100, maxCapacity: 200, regenerationRate: 10 },
      tokens: { initial: 50, maxCapacity: 100, regenerationRate: 5 },
      energy: { initial: 100, maxCapacity: 150, regenerationRate: 15 }
    }
  },

  // 🗳️ УРОВЕНЬ 2: "Electronic Voting" - Валидация голосов
  {
    id: 2,
    title: "Электронное голосование",
    description: "Защитите систему голосования от подделки голосов. Изучите mapping и модификаторы.",
    difficulty: 'beginner',
    xpReward: 200,
    badge: "🗳️", 
    theme: 'voting',
    objectives: [
      "Создать систему голосования",
      "Использовать mapping для хранения голосов",
      "Добавить модификаторы доступа",
      "Валидировать все голоса с помощью require",
      "Защитить от множественного голосования"
    ],
    initialCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    // Создайте систему голосования
}`,
    solution: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    address public owner;
    mapping(address => bool) public hasVoted;
    mapping(uint256 => uint256) public votes;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function vote(uint256 candidate) public {
        require(!hasVoted[msg.sender], "Already voted");
        require(candidate <= 2, "Invalid candidate");
        
        hasVoted[msg.sender] = true;
        votes[candidate]++;
    }
    
    function getVotes(uint256 candidate) public view returns (uint256) {
        return votes[candidate];
    }
}`,
    hints: [
      {
        id: "voting-hint-1",
        condition: "no_mapping",
        title: "Хранение голосов",
        content: "Используйте mapping(address => bool) для отслеживания проголосовавших"
      },
      {
        id: "voting-hint-2",
        condition: "no_modifier", 
        title: "Модификаторы доступа",
        content: "Добавьте modifier onlyOwner для ограничения доступа"
      }
    ],
    validationRules: [
      {
        type: 'contains',
        value: 'mapping(address => bool)',
        errorMessage: 'Используйте mapping для отслеживания голосов'
      },
      {
        type: 'modifier_used',
        value: 'onlyOwner',
        errorMessage: 'Добавьте модификатор onlyOwner'
      },
      {
        type: 'require_statement',
        value: 'require',
        errorMessage: 'Используйте require для валидации'
      }
    ],
    enemyTypes: ['vote_faker', 'poll_manipulator'],
    towerTypes: ['validator', 'access_controller'],
    mapLayout: [
      { x: 50, y: 150 },
      { x: 200, y: 100 },
      { x: 400, y: 200 },
      { x: 600, y: 100 },
      { x: 750, y: 250 },
      { x: 50, y: 350 },
      { x: 200, y: 400 },
      { x: 400, y: 300 },
      { x: 600, y: 350 },
      { x: 750, y: 250 }
    ],
    specialMechanics: [
      {
        id: 'vote_validation',
        type: 'combo_system',
        config: { 
          combos: [
            { towers: ['validator', 'access_controller'], bonus: 1.5 }
          ]
        }
      }
    ],
    resources: {
      gas: { initial: 150, maxCapacity: 300, regenerationRate: 15 },
      tokens: { initial: 75, maxCapacity: 150, regenerationRate: 8 },
      energy: { initial: 120, maxCapacity: 180, regenerationRate: 20 }
    }
  },

  // 🎨 УРОВЕНЬ 3: "Magic Market" - NFT защита
  {
    id: 3,
    title: "Волшебный маркет",
    description: "Защитите NFT торговую площадку от мошенников. Изучите структуры и события.",
    difficulty: 'intermediate',
    xpReward: 300,
    badge: "🎨",
    theme: 'market',
    objectives: [
      "Создать NFT контракт",
      "Использовать struct для данных NFT",
      "Добавить event для логирования сделок", 
      "Защитить от поддельных NFT",
      "Реализовать систему аукционов"
    ],
    initialCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NFTMarketplace {
    // Создайте NFT торговую площадку
}`,
    solution: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NFTMarketplace {
    struct NFT {
        uint256 id;
        address owner;
        string metadata;
        uint256 price;
        bool forSale;
    }
    
    mapping(uint256 => NFT) public nfts;
    uint256 public nftCounter;
    
    event NFTMinted(uint256 id, address owner);
    event NFTSold(uint256 id, address buyer, uint256 price);
    
    function mintNFT(string memory metadata, uint256 price) public {
        nftCounter++;
        nfts[nftCounter] = NFT(nftCounter, msg.sender, metadata, price, true);
        emit NFTMinted(nftCounter, msg.sender);
    }
    
    function buyNFT(uint256 id) public payable {
        require(nfts[id].forSale, "NFT not for sale");
        require(msg.value >= nfts[id].price, "Insufficient payment");
        
        address seller = nfts[id].owner;
        nfts[id].owner = msg.sender;
        nfts[id].forSale = false;
        
        payable(seller).transfer(msg.value);
        emit NFTSold(id, msg.sender, msg.value);
    }
}`,
    hints: [
      {
        id: "nft-hint-1",
        condition: "no_struct",
        title: "Структуры данных",
        content: "Используйте struct NFT для хранения данных о токенах"
      },
      {
        id: "nft-hint-2",
        condition: "no_event",
        title: "События",
        content: "Добавьте event для логирования транзакций"
      }
    ],
    validationRules: [
      {
        type: 'contains',
        value: 'struct',
        errorMessage: 'Используйте struct для данных NFT'
      },
      {
        type: 'contains',
        value: 'event',
        errorMessage: 'Добавьте события для логирования'
      },
      {
        type: 'function_exists',
        value: 'mintNFT',
        errorMessage: 'Создайте функцию для создания NFT'
      }
    ],
    enemyTypes: ['nft_thief', 'auction_sniper', 'market_manipulator'],
    towerTypes: ['auditor', 'escrow_guard'],
    mapLayout: [
      { x: 100, y: 225 },
      { x: 200, y: 150 },
      { x: 300, y: 300 },
      { x: 450, y: 100 },
      { x: 550, y: 350 },
      { x: 650, y: 200 },
      { x: 700, y: 225 }
    ],
    specialMechanics: [
      {
        id: 'nft_protection',
        type: 'temporal_effects',
        config: {
          effects: ['freeze', 'burn'],
          durations: [3000, 5000]
        }
      }
    ],
    resources: {
      gas: { initial: 200, maxCapacity: 400, regenerationRate: 20 },
      tokens: { initial: 100, maxCapacity: 200, regenerationRate: 10 },
      energy: { initial: 150, maxCapacity: 220, regenerationRate: 25 }
    }
  },

  // 🏛️ УРОВЕНЬ 4: "DAO Council" - Децентрализованная защита
  {
    id: 4,
    title: "Совет DAO",
    description: "Защитите DAO от враждебного захвата. Изучите децентрализованное управление.",
    difficulty: 'advanced',
    xpReward: 400,
    badge: "🏛️",
    theme: 'dao',
    objectives: [
      "Создать DAO контракт",
      "Реализовать систему голосования токенами",
      "Добавить предложения и их выполнение",
      "Защитить от враждебных предложений",
      "Победить Malicious Governor"
    ],
    initialCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DAO {
    // Создайте децентрализованную организацию
}`,
    solution: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DAO {
    struct Proposal {
        uint256 id;
        string description;
        uint256 votes;
        uint256 endTime;
        bool executed;
        mapping(address => bool) voted;
    }
    
    mapping(address => uint256) public tokens;
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCounter;
    uint256 public totalSupply = 1000000;
    
    event ProposalCreated(uint256 id, string description);
    event VoteCast(uint256 proposalId, address voter, uint256 weight);
    
    function distributeTokens(address to, uint256 amount) public {
        require(tokens[to] + amount <= totalSupply / 10, "Too many tokens");
        tokens[to] += amount;
    }
    
    function createProposal(string memory description) public {
        require(tokens[msg.sender] >= 100, "Need tokens to propose");
        proposalCounter++;
        proposals[proposalCounter].id = proposalCounter;
        proposals[proposalCounter].description = description;
        proposals[proposalCounter].endTime = block.timestamp + 1 days;
        
        emit ProposalCreated(proposalCounter, description);
    }
    
    function vote(uint256 proposalId) public {
        require(!proposals[proposalId].voted[msg.sender], "Already voted");
        require(block.timestamp < proposals[proposalId].endTime, "Voting ended");
        require(tokens[msg.sender] > 0, "No voting power");
        
        proposals[proposalId].voted[msg.sender] = true;
        proposals[proposalId].votes += tokens[msg.sender];
        
        emit VoteCast(proposalId, msg.sender, tokens[msg.sender]);
    }
}`,
    hints: [
      {
        id: "dao-hint-1",
        condition: "no_governance",
        title: "Токены управления",
        content: "Используйте mapping для хранения токенов голосования"
      },
      {
        id: "dao-hint-2",
        condition: "no_proposals",
        title: "Система предложений", 
        content: "Создайте struct Proposal для хранения предложений"
      }
    ],
    validationRules: [
      {
        type: 'contains',
        value: 'mapping(address => uint256)',
        errorMessage: 'Добавьте систему токенов управления'
      },
      {
        type: 'function_exists',
        value: 'vote',
        errorMessage: 'Создайте функцию голосования'
      },
      {
        type: 'custom',
        value: 'delegation_pattern',
        errorMessage: 'Реализуйте паттерн делегирования'
      }
    ],
    enemyTypes: ['hostile_proposal', 'vote_buyer', 'coordinated_attack'],
    towerTypes: ['delegate', 'governance_guard'],
    mapLayout: [
      { x: 50, y: 150 }, { x: 150, y: 100 }, { x: 250, y: 200 },
      { x: 400, y: 225 }, // Центр
      { x: 550, y: 150 }, { x: 650, y: 300 }, { x: 750, y: 225 },
      { x: 50, y: 350 }, { x: 150, y: 400 }, { x: 250, y: 300 }
    ],
    specialMechanics: [
      {
        id: 'collective_defense',
        type: 'combo_system',
        config: {
          requiresAll: true,
          globalBonus: 2.0
        }
      }
    ],
    boss: {
      id: 'malicious_governor',
      name: 'Malicious Governor',
      type: 'hostile_proposal',
      health: 1000,
      abilities: [
        {
          id: 'hostile_takeover',
          name: 'Враждебный захват',
          description: 'Пытается захватить контроль над DAO',
          cooldown: 10000,
          effect: 'disable_towers'
        },
        {
          id: 'vote_manipulation',
          name: 'Манипуляция голосами',
          description: 'Подделывает результаты голосования',
          cooldown: 8000,
          effect: 'reverse_votes'
        }
      ],
      defeatedBy: ['governance_pattern', 'delegation_system', 'vote_validation']
    },
    resources: {
      gas: { initial: 300, maxCapacity: 500, regenerationRate: 25 },
      tokens: { initial: 150, maxCapacity: 300, regenerationRate: 15 },
      energy: { initial: 200, maxCapacity: 300, regenerationRate: 30 }
    }
  },

  // ⚡ УРОВЕНЬ 5: "Hacker's Challenge" - Финальная битва
  {
    id: 5,
    title: "Вызов хакера",
    description: "Финальная битва с The Black Hat. Используйте все знания безопасности Solidity.",
    difficulty: 'advanced',
    xpReward: 500,
    badge: "⚡",
    theme: 'security',
    objectives: [
      "Защитить от reentrancy атак",
      "Реализовать circuit breaker",
      "Защитить от MEV атак",
      "Использовать все паттерны безопасности",
      "Победить The Black Hat"
    ],
    initialCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Встроенная защита от reentrancy атак
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract SecureVault is ReentrancyGuard {
    // Создайте максимально безопасный контракт
    // Используйте modifier nonReentrant для защиты от reentrancy
}`,
    solution: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Встроенная защита от reentrancy атак
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract SecureVault is ReentrancyGuard {
    mapping(address => uint256) public balances;
    bool public emergency = false;
    address public owner;
    uint256 public constant MAX_WITHDRAW = 1 ether;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier notInEmergency() {
        require(!emergency, "Emergency mode active");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function deposit() public payable notInEmergency {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint256 amount) public nonReentrant notInEmergency {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(amount <= MAX_WITHDRAW, "Exceeds max withdraw");
        
        // Checks-Effects-Interactions pattern
        balances[msg.sender] -= amount;
        
        (bool success,) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    function emergencyStop() public onlyOwner {
        emergency = true;
    }
    
    function resume() public onlyOwner {
        emergency = false;
    }
}`,
    hints: [
      {
        id: "security-hint-1",
        condition: "reentrancy_vulnerable",
        title: "Reentrancy защита",
        content: "Используйте modifier nonReentrant для защиты от повторных входов и следуйте паттерну Checks-Effects-Interactions"
      },
      {
        id: "security-hint-2",
        condition: "no_circuit_breaker",
        title: "Circuit Breaker",
        content: "Добавьте emergency stop для критических ситуаций"
      }
    ],
    validationRules: [
      {
        type: 'contains',
        value: 'ReentrancyGuard',
        errorMessage: 'Используйте ReentrancyGuard для защиты'
      },
      {
        type: 'custom',
        value: 'checks_effects_interactions',
        errorMessage: 'Следуйте паттерну Checks-Effects-Interactions'
      },
      {
        type: 'contains',
        value: 'emergency',
        errorMessage: 'Добавьте emergency stop механизм'
      }
    ],
    enemyTypes: ['reentrancy_attacker', 'flash_loan_exploiter', 'mev_bot'],
    towerTypes: ['reentrancy_guard', 'circuit_breaker', 'mev_protector'],
    mapLayout: [
      { x: 50, y: 100 }, { x: 120, y: 180 }, { x: 200, y: 120 },
      { x: 300, y: 200 }, { x: 380, y: 100 }, { x: 450, y: 300 },
      { x: 520, y: 150 }, { x: 600, y: 250 }, { x: 680, y: 180 },
      { x: 750, y: 225 }
    ],
    specialMechanics: [
      {
        id: 'advanced_security',
        type: 'interactive_map',
        config: {
          traps: true,
          portals: true,
          healing: true
        }
      }
    ],
    boss: {
      id: 'the_black_hat',
      name: 'The Black Hat',
      type: 'reentrancy_attacker',
      health: 2000,
      abilities: [
        {
          id: 'reentrancy_storm',
          name: 'Reentrancy Storm',
          description: 'Массированная reentrancy атака',
          cooldown: 15000,
          effect: 'massive_reentrancy'
        },
        {
          id: 'flash_loan_devastation',
          name: 'Flash Loan Devastation',
          description: 'Опустошающая flash loan атака',
          cooldown: 12000,
          effect: 'flash_loan_attack'
        },
        {
          id: 'mev_manipulation',
          name: 'MEV Manipulation',
          description: 'Манипуляция порядком транзакций',
          cooldown: 10000,
          effect: 'mev_front_running'
        }
      ],
      defeatedBy: ['reentrancy_guard', 'circuit_breaker', 'mev_protection', 'perfect_code']
    },
    resources: {
      gas: { initial: 600, maxCapacity: 900, regenerationRate: 40 },
      tokens: { initial: 500, maxCapacity: 700, regenerationRate: 30 },
      energy: { initial: 400, maxCapacity: 550, regenerationRate: 50 }
    }
  }
]

// 🎯 **СТАТИЧЕСКИЕ ДАННЫЕ ВРАГОВ**
type EnemyStats = {
  health: number
  speed: number
  reward: number
  icon: string
  abilities: EnemyAbility[]
}

export const ENEMY_STATS: Record<EnemyType, EnemyStats> = {
  // Уровень 1
  basic_hacker: {
    health: 50,
    speed: 30,
    reward: 10,
    icon: "🔴",
    abilities: []
  },
  
  // Уровень 2
  vote_faker: {
    health: 60,
    speed: 25,
    reward: 15,
    icon: "🗳️",
    abilities: [{ id: 'fake_vote', name: 'Поддельный голос', type: 'invisibility', cooldown: 5000 }]
  },
  poll_manipulator: {
    health: 80,
    speed: 35,
    reward: 20,
    icon: "📊", 
    abilities: [{ id: 'manipulate', name: 'Манипуляция опросом', type: 'shield', cooldown: 8000 }]
  },
  
  // Уровень 3
  nft_thief: {
    health: 70,
    speed: 40,
    reward: 25,
    icon: "🎨",
    abilities: [{ id: 'steal_nft', name: 'Кража NFT', type: 'teleport', cooldown: 6000 }]
  },
  auction_sniper: {
    health: 90,
    speed: 50,
    reward: 30,
    icon: "💰",
    abilities: [{ id: 'snipe_bid', name: 'Снайперская ставка', type: 'clone', cooldown: 10000 }]
  },
  market_manipulator: {
    health: 120,
    speed: 30,
    reward: 35,
    icon: "🏪",
    abilities: [{ id: 'price_manipulation', name: 'Манипуляция цен', type: 'shield', cooldown: 12000 }]
  },
  
  // Уровень 4
  hostile_proposal: {
    health: 150,
    speed: 25,
    reward: 40,
    icon: "🏛️",
    abilities: [{ id: 'hostile_takeover', name: 'Враждебный захват', type: 'clone', cooldown: 8000 }]
  },
  vote_buyer: {
    health: 100,
    speed: 45,
    reward: 35,
    icon: "🗳️",
    abilities: [{ id: 'buy_votes', name: 'Скупка голосов', type: 'heal', cooldown: 7000 }]
  },
  coordinated_attack: {
    health: 200,
    speed: 35,
    reward: 50,
    icon: "👥",
    abilities: [{ id: 'coordinate', name: 'Координированная атака', type: 'clone', cooldown: 15000 }]
  },
  
  // Уровень 5
  reentrancy_attacker: {
    health: 180,
    speed: 40,
    reward: 60,
    icon: "🔄",
    abilities: [
      { id: 'reentrancy', name: 'Reentrancy атака', type: 'teleport', cooldown: 5000 },
      { id: 'recursive_call', name: 'Рекурсивный вызов', type: 'clone', cooldown: 8000 }
    ]
  },
  flash_loan_exploiter: {
    health: 250,
    speed: 35,
    reward: 80,
    icon: "🌊",
    abilities: [{ id: 'flash_loan', name: 'Flash Loan эксплойт', type: 'shield', cooldown: 12000 }]
  },
  mev_bot: {
    health: 220,
    speed: 60,
    reward: 70,
    icon: "🎭",
    abilities: [
      { id: 'front_run', name: 'Front-running', type: 'teleport', cooldown: 3000 },
      { id: 'sandwich', name: 'Sandwich атака', type: 'invisibility', cooldown: 6000 }
    ]
  }
}

// 🛡️ **СТАТИЧЕСКИЕ ДАННЫЕ БАШЕН**
type TowerStats = {
  damage: number
  range: number
  cost: { gas: number; tokens: number; energy: number }
  icon: string
  abilities: TowerAbility[]
}

export const TOWER_STATS: Record<TowerType, TowerStats> = {
  // Уровень 1
  firewall: {
    damage: 15, // Увеличиваем урон для динамики
    range: 80,
    cost: { gas: 40, tokens: 0, energy: 10 }, // Дешевая базовая башня
    icon: "🛡️",
    abilities: []
  },
  
  // Уровень 2
  validator: {
    damage: 20, // Увеличиваем урон для динамики
    range: 100,
    cost: { gas: 60, tokens: 25, energy: 15 }, // Умеренная цена
    icon: "✅",
    abilities: [{ id: 'validate_signature', name: 'Валидация подписи', type: 'area_damage', cooldown: 3000 }]
  },
  access_controller: {
    damage: 18, // Увеличиваем урон для динамики
    range: 70,
    cost: { gas: 50, tokens: 20, energy: 20 }, // Дешевле
    icon: "🔐",
    abilities: [{ id: 'block_access', name: 'Блокировка доступа', type: 'slow_effect', cooldown: 2000 }]
  },
  
  // Уровень 3
  auditor: {
    damage: 25, // Увеличиваем урон для динамики
    range: 120,
    cost: { gas: 80, tokens: 40, energy: 25 }, // Дороже, но эффективнее
    icon: "📋",
    abilities: [{ id: 'audit_transaction', name: 'Аудит транзакции', type: 'slow_effect', cooldown: 4000 }]
  },
  escrow_guard: {
    damage: 22, // Увеличиваем урон для динамики
    range: 85,
    cost: { gas: 70, tokens: 50, energy: 30 }, // Средняя цена
    icon: "🏛️",
    abilities: [{ id: 'escrow_protection', name: 'Защита эскроу', type: 'shield', cooldown: 5000 }]
  },
  
  // Уровень 4
  delegate: {
    damage: 28, // Увеличиваем урон для динамики
    range: 95,
    cost: { gas: 90, tokens: 60, energy: 35 }, // Высокая эффективность
    icon: "🎯",
    abilities: [{ id: 'delegate_vote', name: 'Делегированное голосование', type: 'combo_boost', cooldown: 6000 }]
  },
  governance_guard: {
    damage: 30, // Увеличиваем урон для динамики
    range: 110,
    cost: { gas: 100, tokens: 80, energy: 40 }, // Премиум башня
    icon: "🏆",
    abilities: [{ id: 'protect_governance', name: 'Защита управления', type: 'heal_allies', cooldown: 7000 }]
  },
  
  // Уровень 5
  reentrancy_guard: {
    damage: 35, // Увеличиваем урон для динамики
    range: 120,
    cost: { gas: 120, tokens: 100, energy: 50 }, // Дорогая, но мощная
    icon: "🔒",
    abilities: [{ id: 'prevent_reentrancy', name: 'Защита от Reentrancy', type: 'area_damage', cooldown: 5000 }]
  },
  circuit_breaker: {
    damage: 22, // Умеренный урон для наблюдаемых боев
    range: 100,
    cost: { gas: 110, tokens: 90, energy: 45 }, // Сбалансированная
    icon: "🛡️",
    abilities: [{ id: 'emergency_stop', name: 'Аварийная остановка', type: 'slow_effect', cooldown: 8000 }]
  },
  mev_protector: {
    damage: 40, // Увеличиваем урон для динамики
    range: 90,
    cost: { gas: 150, tokens: 120, energy: 60 }, // Дорогая, но оправданно
    icon: "⚡",
    abilities: [{ id: 'prevent_mev', name: 'Защита от MEV', type: 'combo_boost', cooldown: 4000 }]
  }
}

export default LEVEL_CONFIGS 