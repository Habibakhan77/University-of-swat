/**
 * Department microsite content: vision, mission, the head's message, labs & facilities and gallery photos.
 *
 * Source: each department's own page on uswat.edu.pk (checked 12 November 2026; the path is `source` in
 * data/academics.ts). Nothing here is invented:
 *
 * - Vision and mission are the department's official statements. They are kept as published, with only
 *   spelling and grammar slips fixed (e.g. "carrier" → "career", a sentence cut off on the old page closed).
 *   Departments whose page states neither are left out; the website then shows no Vision/Mission block.
 * - The head's message is copied character for character, never edited or translated, and is shown with a
 *   link to the page it comes from (it is a real person's words). Only two departments publish one:
 *   Biotechnology ("Director Message") and Economics ("Chairman Message"). Neither page names the author
 *   next to the message, so only the title is given.
 * - Labs are the ones each page names, with the status the page gives ("under establishment", "planned").
 * - Gallery photos are the department's own event photos already used as news covers (see POST_PHOTOS) plus
 *   the faculty photos taken at a department's activity, and the Food and Beverages Laboratory photos.
 *
 * No department page lists publications, alumni stories or achievements, so none are seeded: the website
 * shows an empty state for those sections until the department adds them in Strapi.
 */
import type { PhotoKey } from './photos';

export interface DepartmentAbout {
  /** Path on uswat.edu.pk the statements were taken from. */
  source: string;
  vision?: string;
  /** Mission paragraphs, then optional bullet points. */
  mission?: string[];
  missionPoints?: string[];
  /** Verbatim. `by` is the title the page gives the message. */
  headMessage?: { by: string; paragraphs: string[] };
}

export interface LabSeed {
  department: string;
  name: string;
  state: 'operational' | 'under_establishment' | 'planned';
  summary: string;
  inauguratedOn?: string;
  /** Image files on uswat.edu.pk (path after /wp-content/uploads/); the first is the cover. */
  images?: Array<{ file: string; alt: string }>;
  source: string;
}

export interface GallerySeed {
  department: string;
  photo: PhotoKey;
  caption: string;
  takenOn?: string;
}

export const DEPARTMENT_ABOUT: Record<string, DepartmentAbout> = {
  'Department of English and Foreign Languages': {
    source: '/department-of-english-and-foreign-languages/',
    vision:
      'To be a leading department nationally and internationally recognized for the study of English literature and linguistics. In the future, we aim to establish an excellence center for foreign language studies including English, Chinese, Japanese, German, Spanish, and French languages.',
    mission: [
      'To establish a high quality department that provides a high quality academic environment and relevant education for the needs of the students. We inculcate and groom creativity and independent thinking through student-centered participatory teaching methods.',
    ],
  },
  'Department of Islamic and Arabic Studies': {
    source: '/department-of-islamic-and-arabic-studies/',
    vision:
      'Department of Islamic & Arabic Studies aspires to inculcate the knowledge of Islam with relevance to the contemporary world particularly from the relevance of quality and religious harmony.',
    mission: [
      'Department of Islamic & Arabic Studies has strengthened and channelized its resources to inculcate Islamic values and religious harmony among its graduates through intellectual interactions, research, dialogues and intra-faith modernity in relevance to the demands of the modern world.',
    ],
  },
  'Department of Pashto and Local Languages': {
    source: '/department-of-pashto/',
    mission: [
      'Our mission is to foster a deep understanding and appreciation of Pashto language, literature, and culture among students, scholars, and the wider community. Through rigorous academic programs, innovative research initiatives, and vibrant cultural activities, we aim to equip our students with the knowledge, skills, and insights necessary to engage critically with Pashto literature and contribute meaningfully to its development.',
    ],
  },
  'Department of Law & Shariah': {
    source: '/department-of-law-sharia/',
    vision:
      'To make the faculty of law and sharia a very distinctive center of excellence which will provide legal education and produce graduates having full grasp of sharia and common law principles.',
    mission: ['To produce law graduates who are able to meet the challenges of today and tomorrow.'],
  },
  'Department of Urdu': {
    source: '/department-of-urdu/',
    mission: [
      'Our mission is to cultivate a deep appreciation and understanding of Urdu language, literature, and culture among students, scholars, and the wider community. Through rigorous academic programs, innovative research endeavors, and dynamic cultural initiatives, we aim to equip our students with the knowledge, skills, and insights necessary to engage critically with Urdu literature and contribute meaningfully to its preservation and advancement.',
    ],
  },
  'Department of Physics': {
    source: '/department_of_physics/',
    // The page gives one combined "Vision and Mission" statement.
    mission: [
      'The main objective of starting the Physics programme is to impart students with a conceptual understanding of the fundamental principles of physics, natural laws and their interpretation, as well as mathematical formulation of the physical phenomena in nature. It is aimed to develop the critical skills of the students necessary for solving problems from their physical surroundings, also to develop the capability of analyzing, addressing and posing solutions to problems of natural importance and to instill a deep appreciation of the need for optimum utilization of natural resources and environment. To produce well trained graduates and researchers capable enough to address the future challenges both at regional and international levels.',
      'Apart from teaching, our mission is to cultivate an enthusiastic research culture by establishing laboratories equipped with sophisticated research facilities and establishing strong collaborations with other national and international institutions. We envision our Institute to play a leading role in teaching and research and expect our graduates will serve the nation and humanity.',
    ],
  },
  'Department of Mathematics and Statistics': {
    source: '/department-of-mathematics-and-statistics/',
    mission: [
      'The department promotes advanced learning methodologies and persistently strives to develop creative thinking skills in students in order to prepare them to take effective decisions on the basis of applying the statistical methods. The use of modern statistical software has made the science of statistics more accurate.',
    ],
  },
  'Department of Geology': {
    source: '/department_of_geology/',
    vision:
      'Building on the existing strengths, the Centre for Earth & Space Sciences is bridging a link between the academia and industry. Such a link will help in the academic and professional growth of the students and the faculty members.',
    mission: [
      'Department of Geology has a mission to provide state of the art teaching and research facilities to produce professional graduates at the highest national and international levels for academic institutions, Oil Companies and Mineral exploration/mining. We also aim to provide a research based environment by establishing laboratories equipped with sophisticated research facilities and establishing strong collaborations with other renowned institutions.',
    ],
  },
  'Department of Economics and Development Studies': {
    source: '/department-of-economics-and-development-studies/',
    vision:
      'To impart quality education in the fields of Economics and Development studies and to excel in the field of research at par with the reputed international institutions followed by establishing linkages with national and international institutions.',
    mission: [
      'To develop critical thinking among the students and enabling them to take informed decisions in the practical life is the prime responsibility of the DEDS. Moreover, the students would be engaged in seminars, trainings, workshops and research activities to keep them updated and well prepared for any job of responsibility assigned to them in future.',
    ],
    headMessage: {
      by: 'Chairman',
      paragraphs: [
        'The academic institutions should work beyond its traditional role of teaching and needs to work as catalyst for the uplift of societies. The faculty and researchers not only brainstorm the youth on key global, regional and local challenges but also conduct fair research on cross cutting issues of the economy to guide the policy makers for informed decisions. These institutions also develop linkages with national and international organizations to tackle these challenges involving faculty, researchers and students. Some of these challenges are increasing inflation, debt burden, circular debt, poverty, depletion of natural capital, loss of biodiversity, lack of economic governance, water-food-energy insecurity, unemployment etc. The Department of Economics and Development Studies (DEDS), at University of Swat is also committed to offer various undergraduate and postgraduate degree programs. Currently, the DEDS offer BS Economics and BS Development Studies degree programs and still in process to go for MPhil and PhD programs in Economics and Development Studies. Despite limited resources, the DEDS is also planning to start Research Centre for Sustainable Development (RCSD) to carry out research on key issues of local, regional and global interest. The RCSD aims to hunt funding opportunities, building the capacity of interns, develop linkages, organize different awareness campaigns, trainings, workshops and seminars. The DEDS equally provide opportunities for faculty, researchers and students to contribute and participate in the research and academic activities.',
      ],
    },
  },
  'Department of Archaeology': {
    source: '/department-of-archaeology/',
    vision:
      'To become a leading department in archaeological research, education, and heritage management in Pakistan, with a special focus on the Swat Valley and the wider Indo-Pakistan region, by fostering global collaborations, advancing innovative methods of exploration, excavation, and conservation, and contributing to the preservation of cultural heritage for future generations.',
    mission: ['The BS Archaeology program at the University of Swat has been launched with the following missions:'],
    missionPoints: [
      'To prepare skilled professionals in the fields of Archaeology and Cultural Heritage Management capable of addressing emerging challenges in these disciplines.',
      'To equip students with advanced knowledge and skills required for the protection and promotion of cultural resources of the region.',
      'To prepare graduates with diverse competencies who can contribute as policymakers and entrepreneurs in the future.',
      'To integrate the cultural heritage sector with the tourism industry, for developing the area as an Archaeological tourism destination.',
      'To develop students’ ability to demonstrate knowledge, apply skills, and communicate ideas effectively.',
      'To build professional competencies in exploration, documentation, excavation, and conservation of archaeological sites and monuments of Pakistan.',
      'To support human resource development by providing students with advanced and updated knowledge in archaeology.',
      'To prepare students to address legal issues related to cultural heritage in accordance with national legislation and international charters.',
    ],
  },
  'Department of Tourism and Hospitality': {
    source: '/department-of-tourism-and-hospitality/',
    vision:
      'To be recognized as a leading center of excellence in tourism and hospitality education, research, and innovation, producing globally competitive graduates who promote sustainable tourism, celebrate cultural diversity, and advance the hospitality industry at national and international levels.',
    mission: [
      'The Department of Tourism and Hospitality at the University of Swat is committed to providing world-class education that blends academic rigor with practical experience in tourism and hospitality by fostering innovation, leadership, and entrepreneurship to prepare graduates for dynamic roles in the global industry.',
    ],
  },
  'Department of Management & Commerce': {
    source: '/department-of-management-commerce/',
    vision:
      'Our vision is to nurture second to none graduates by acting as a springboard for students to achieve their true potential. The essence of our vision and mission statements is best espoused in our credo statement: “Technological at heart, Inventive in mind and socially responsible in action”. The achievement of our vision is contingent upon our incessant adherence to principles of access, quality, relevance, fairness, service, and upholding merit in line with the mission and vision statement of the University of Swat.',
    mission: [
      'The Mission of the Department of Management and Commerce, University of Swat revolves around development of wholesome individuals through integration of a unique blend of curricular, co-curricular and extracurricular activities to combat the issue of credential creep and educational inflation. Our mission is to create value creating individuals who create value for themselves and value for others in the form of useful contributions to triple helix stakeholders (Academia, Industry & Government).',
      'The degree programs are designed to relieve the societal pain points and create avenues for development of the catchment area of district Swat by germinating innovation and instilling a spirit of national competitiveness. To achieve a balanced scorecard in terms of people, planet and prosperity (triple bottom line) we strive to induce positive social, economic and environmental change in the catchment area of Swat.',
    ],
  },
  'Department of Pakistan Studies': {
    source: '/department_of_pakistan_studies/',
    vision:
      'Department of Pakistan Studies, University of Swat offers quality education about Land and People of Pakistan to its students. Using state of the art academic skills, robust and rigorous research practices, it offers a multidisciplinary program in Pakistan Studies.',
    mission: [
      'Department of Pakistan Studies, University of Swat aspires to educate, train and produce highly skilled and excellently endowed scholars in the field of Pakistan Studies and related areas. It aspires to promote a culture of excellent research and quality education.',
    ],
  },
  'Department of Media and Communication Studies': {
    source: '/department-of-media-and-communication-studies/',
    vision: 'To provide best possible quality education in Journalism & Mass Communication in the country.',
    mission: [
      'The mission of the Department of Media & Communication Studies is to serve the country by producing qualified and skilled journalists and scholars, who can meet the market demand.',
      'To sustain its mission, the Department of Media & Communication Studies dedicates itself to provide leadership to:',
    ],
    missionPoints: [
      'Maintain advance standards of excellence in media studies.',
      'Compete with journalism programs offered at national and international level.',
      'Assess the current trends and meet the challenges ahead.',
      'Transfer the value and benefits of journalism education to students, academia and field.',
    ],
  },
  'Department of Social and Gender Studies': {
    source: '/department-of-social-and-gender-studies/',
    vision: 'Facilitating students more practically to understand the social world in a positive and better way.',
    mission: ['To contribute to the society at local and international level with more devotion to humanity, belief, peace and harmony.'],
  },
  'Department of Education and Staff Training': {
    source: '/department_of_education_and_staff_training/',
    vision:
      'The vision of the Department of Education and Staff Training is to work for a sustainable and peaceful society, through quality education, relevant training and highly educated graduates in close liaison with the community.',
    mission: [
      'Since education by its very nature is emancipatory, the Centre, through well qualified and skillful faculty and staff members, is striving to produce quality graduates who can be the positive agents of change.',
    ],
  },
  'Department of Environmental Sciences': {
    source: '/department-of-environmental-sciences/',
    vision:
      'The Department focuses to pioneer a new generation of research and teaching methods that understand the fundamental processes which contribute to environmental pollution and natural resource degradation, and arrive at solutions to pressing societal problems; moreover, to prepare graduates for understanding environmental systems, predicting environmental changes, participating in the management of the environment, and contributing to the promotion of a sustainable society.',
    missionPoints: [
      'To provide formal education and research in the field of Environmental and Conservation Sciences to bring the education standards up to the international level.',
      'To work for the conservation of natural resources, which are often characterized by their biodiversity and geo-diversity.',
      'To provide a good research environment for publishing research outcomes in the journals of international repute.',
      'To provide professional services such as special trainings, analyses, surveys and consultancies to the manufacturing and processing industries, NGOs, CBOs, engineering firms etc.',
    ],
  },
  'Department of Chemistry': {
    source: '/department-of-chemistry/',
    vision:
      'The vision of the Institute of Chemical Sciences is to advance the chemical sciences by engaging faculty – qualified from well reputed organizations – who provide quality education, research, and service opportunities. We will graduate scientists who are knowledgeable in chemistry, embrace recognized standards of ethical scientific behavior, and engage in safe and sustainable chemical practices.',
    mission: [
      'The Institute of Chemical Sciences pledges itself to encourage in the broadest and most liberal manner, the advancement of science and particularly chemistry in all of its branches including Analytical, Bio, Inorganic, Organic and Physical chemistry through its education, research, and service missions.',
    ],
  },
  'Department of Zoology': {
    source: '/department-of-zoology/',
    vision:
      'To achieve excellence in the field of animal sciences through high quality education and research linked to national and international need.',
    mission: [
      'The Department of Zoology is committed to the production of well-rounded international standard academicians in the field of animal sciences. The Centre aims to give coverage of modern sciences, followed by the opportunity to specialize in one or more areas reflecting the students’ interest. The Program, besides providing a broad educational background to its students with a foundation in the basic principles will inculcate high level of integrity, responsibility at individual and departmental level and quality research skills to enable the graduates to participate in community development projects. The mission of the Centre is to grow into an outstanding world class organization in all areas of its operation.',
    ],
  },
  'Department of Botany': {
    source: '/department-of-botany/',
    vision:
      'To establish an internationally acclaimed department of Botany contributing to the advancement of teaching, research and development of manpower, ensuring quality education and human resources to meet the coming national and global challenges, and working for the restoration of natural resources of the country in general and of the region in particular.',
  },
  'Department of Biotechnology, Genetics, Forensic and Microbiology': {
    source: '/department-of-biotechnology-genetics-forensic-and-microbiology/',
    vision:
      'To create a world-renowned Department of Biotechnology, Genetics, Forensic and Microbiology, promoting innovation, fostering multidisciplinary research, and imparting high-quality education to address societal concerns and enhance scientific understanding.',
    mission: [
      'The Department of Biotechnology, Genetics, Forensic and Microbiology is committed to provide a foundation in the basic principles of Biological Sciences with high level of veracity and quality education/research skills to its students enabling them to serve professionally in industries, institutions and community. The graduates would be able to face the future challenges. We aspire and strive to facilitate and equip students with the knowledge, skills, and ethical principles essential for career development and to make significant contributions to society.',
    ],
    headMessage: {
      by: 'Director',
      paragraphs: [
        'Welcome to the Department of Biotechnology, Genetics, Forensic and Microbiology, University of Swat. Since the inception of University, Department of Biotechnology, Genetics, Forensic and Microbiology has offered an interdisciplinary platform for innovation and knowledge creation in the ambit of all its fields. Owing to the importance of integrated areas in life sciences, we are focused on providing interconnected academic and research environment to our students and faculty. Microbiological and biotechnological research endeavors are vital to all life forms and investigating their unexplored relations with humans, plants and animals carry tremendous research importance in all times to come. Here, we are keen to smoothly provide theoretical and practical knowledge in the areas of medical microbiology, microbial biotechnology, bioprocessing, molecular biology, tissue culture and nanobiotechnology. We have also collaborative links with eminent institutes in the country and abroad for research of mutual interests and essence. We are proud of our graduates who are capable of competing and securing good positions in highly reputed national and international organizations.',
        'We are committed and aspire to make this Centre a globally renowned place by practicing ethically responsible science and providing creatively transformed human skilled capital to the society.',
      ],
    },
  },
};

export const LABS: LabSeed[] = [
  {
    department: 'Department of Agricultural Sciences and Forestry',
    name: 'Forestry Lab',
    state: 'operational',
    summary: 'The department’s teaching laboratory for forestry courses.',
    source: '/department-of-agricultural-sciences-and-forestry/',
  },
  {
    department: 'Department of Agricultural Sciences and Forestry',
    name: 'Tree Ring (Dendrochronology) Laboratory',
    state: 'operational',
    summary: 'Tree-ring research, home of the department’s dendrochronology research group.',
    source: '/department-of-agricultural-sciences-and-forestry/',
  },
  {
    department: 'Department of Tourism and Hospitality',
    name: 'Food and Beverages Laboratory',
    state: 'operational',
    inauguratedOn: '2024-10-15',
    summary:
      'Practical training in food and beverage service for Tourism and Hospitality students, preparing them for careers in national and international hospitality. Opened at the Institute of Cultural Heritage, Tourism and Hospitality Management on 15 October 2024.',
    images: [
      { file: '2025/01/WhatsApp-Image-2024-10-15-at-2.35.09-PM-1024x576.jpeg', alt: 'Inauguration of the Food and Beverages Laboratory, University of Swat, 15 October 2024' },
      { file: '2025/01/WhatsApp-Image-2024-10-15-at-8.45.16-PM-1024x768.jpeg', alt: 'Guests and students at the opening of the Food and Beverages Laboratory' },
    ],
    source: '/department-of-tourism-and-hospitality/',
  },
  {
    department: 'Department of Environmental Sciences',
    name: 'Environmental Laboratory',
    state: 'under_establishment',
    summary: 'For indoor research and physical, chemical and biological analysis of environmental samples.',
    source: '/department-of-environmental-sciences/',
  },
  {
    department: 'Department of Environmental Sciences',
    name: 'GIS Laboratory',
    state: 'planned',
    summary: 'A GIS lab with current equipment and software for spatial analysis and remote sensing.',
    source: '/department-of-environmental-sciences/',
  },
];

/**
 * Faculty photos that show one department's own activity. Post photos are added automatically for the
 * posts linked to a department (see POST_PHOTOS).
 */
export const DEPARTMENT_GALLERY: GallerySeed[] = [
  { department: 'Department of Geology', photo: 'facultyGeology', caption: 'Five-day geological field excursion in northern Pakistan' },
  { department: 'Department of Environmental Sciences', photo: 'facultyEnvironment', caption: 'Training on remote sensing for climate-resilient agriculture' },
  { department: 'Department of Law & Shariah', photo: 'facultyLaw', caption: '8th-semester students visit the Supreme Court of Pakistan and the Federal Shariat Court' },
];
