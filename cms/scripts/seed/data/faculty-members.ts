/**
 * Faculty members as listed on each department's page on uswat.edu.pk (fetched 12 Nov 2026), in the
 * page's order. Names, designations, roles, qualifications, e-mail addresses and photos are copied
 * exactly as published, typos included; nothing is added. Corrections are limited to the cases noted
 * inline, where copying would publish something the page itself shows to be wrong.
 *
 * - `title`: the designation line as written ("Lecturer in Finance"); `designation` is the matching
 *   category for filters and the Urdu site.
 * - `roles`: the other lines under the name (Chairman, Gold Medalist, on study leave…), each as written.
 * - `qualification`: degree and institution lines, as written.
 * - `photo`: the image the page shows (the generic silhouette some entries use is not copied). The seed
 *   uploads the full-size original when uswat.edu.pk has one, else this file.
 * - `isHead`: the chairperson, director or in-charge named on the page.
 *
 * Someone listed by two departments gets a profile in each, as on the official site.
 *
 * Not copied: the Department of Urdu page lists only "Dr. Lala Rukh, Associate Professor in Finance, PhD in
 * Management Sciences", the Management & Commerce entry, evidently pasted by mistake, so Urdu keeps a
 * placeholder. The Allied Health departments publish no list and keep placeholders as well.
 */
/** Faculty Member → designation (enum in the Strapi schema). */
export type Designation =
  | 'professor'
  | 'associate_professor'
  | 'assistant_professor'
  | 'lecturer'
  | 'lab_engineer'
  | 'teaching_assistant'
  | 'visiting_faculty'
  | 'professor_emeritus';

export interface MemberSeed {
  name: string;
  designation: Designation;
  title?: string;
  roles?: string[];
  qualification?: string[];
  email?: string;
  photo?: string;
  googleScholarUrl?: string;
  isHead?: boolean;
}

export interface FacultyListing {
  /** Department page on uswat.edu.pk (path). */
  source: string;
  members: MemberSeed[];
}

/** Keyed by the department's name in data/academics.ts. */
export const FACULTY_LISTS: Record<string, FacultyListing> = {
  'Department of Agricultural Sciences and Forestry': {
    source: '/department-of-agricultural-sciences-and-forestry/',
    members: [
      { name: 'Dr. Zahid Ullah', designation: 'associate_professor', title: 'Associate Professor', email: 'zahidtaxon@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/Dr.-Zahid-Ullah-Profile-pic.jpeg' },
      { name: 'Dr. Naveed Alam', designation: 'assistant_professor', title: 'Assistant Professor', email: 'naveedalam@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2021/03/WhatsApp-Image-2021-03-15-at-3.58.02-AM-1-e1615960066686-150x150.jpeg' },
      { name: 'Dr. Fazal Rabbi', designation: 'assistant_professor', title: 'Assistant Professor', email: 'rabbi.eco@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/11/IMG_42571-150x150.jpg' },
      { name: 'Dr. Bilal Ahmad', designation: 'assistant_professor', title: 'Assistant Professor', email: 'bilalahmad@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2021/03/IMG_9607-sa-e1615804658793-150x150.jpg' },
      { name: 'Dr. Sher Shah', designation: 'assistant_professor', title: 'Assistant Professor', email: 's.shah@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/Dr.Sher_Photo-2-150x150.jpg' },
      { name: 'Mr. Kaleem Mehmood', designation: 'lecturer', title: 'Lecturer', email: 'kaleemmehmood@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2026/11/WhatsApp-Image-2026-11-11-at-14.48.51-150x150.jpeg' },
      { name: 'Dr. Sultan Muhammad', designation: 'lecturer', title: 'Lecturer', email: 'sultanmuhammad@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/Sultan-150x150.jpeg' },
      { name: 'Mr. Hamid-Ur-Rahman', designation: 'lecturer', title: 'Lecturer', email: 'hrahman@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/hamid-e1623211215962-150x150.jpg' },
    ],
  },
  'Department of Archaeology': {
    source: '/department-of-archaeology/',
    members: [
      { name: 'Dr. Zarawar Khan', designation: 'assistant_professor', title: 'Assistant Professor in Archaeology', roles: ['Gold Medalist', 'In-charge'], qualification: ['PhD in Archaeology'], email: 'zarawarkhan@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2021/01/DSC_0100-copy-150x150.jpg', isHead: true },
      { name: 'Mr. Muhammad Waliullah', designation: 'lecturer', title: 'Lecturer', roles: ['Gold Medalist'], email: 'mwali@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2021/03/wali-_Photo-e1616591551465-139x150.jpg' },
    ],
  },
  'Department of Biotechnology, Genetics, Forensic and Microbiology': {
    source: '/department-of-biotechnology-genetics-forensic-and-microbiology/',
    members: [
      { name: 'Dr. Muhammad Nazir Ud-Din', designation: 'associate_professor', title: 'Chairman and Associate Professor', email: 'nazir@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2020/03/dr.Nazir_-254x300.jpg', isHead: true },
      { name: 'Prof. Dr. Fazal Akbar', designation: 'professor', title: 'Professor', email: 'fazalakbar@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/FAZAL-AKBAR-PIC-150x150.jpeg' },
      { name: 'Prof. Dr. Shahid Ali', designation: 'professor', title: 'Professor', email: 'shahidali@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2023/03/My-Pic-150x141.jpeg' },
      { name: 'Dr. Haji Khan', designation: 'associate_professor', title: 'Associate Professor', email: 'hkbiotech@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/07/Haji-Khan-e1720692671175-150x150.jpg' },
      { name: 'Dr. Muhammad Israr', designation: 'associate_professor', title: 'Associate Professor', email: 'israr@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/01/Muhammadisrar1.jpg' },
      { name: 'Dr. Ali Akbar', designation: 'professor', title: 'Professor', email: 'aliakbar@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2023/09/Ali-Akbar-Picture-150x150.jpg' },
      { name: 'Dr. Syed Shujait Ali', designation: 'associate_professor', title: 'Associate Professor', email: 'shujaitswati@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2020/03/Shujiatali.png' },
      { name: 'Dr. Akhar Rasool', designation: 'assistant_professor', title: 'Assistant Professor', email: 'arasool@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2022/06/dr-150x150.png' },
      { name: 'Dr. Nisar Ahmad', designation: 'associate_professor', title: 'Associate Professor', email: 'ahmadn@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/09/unnamed-150x150.jpg' },
      { name: 'Dr. Zahid Hussain', designation: 'associate_professor', title: 'Associate Professor', email: 'zahid@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2020/05/zahid-CBM-e1590185693165.jpg' },
      { name: 'Dr. Mohammad Ali', designation: 'associate_professor', title: 'Associate Professor', email: 'alimoh@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2020/03/muhammad-Ali-1.jpg' },
      { name: 'Dr. Nasib Zaman', designation: 'associate_professor', title: 'Associate Professor', email: 'nasibzaman@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2020/03/nasibzaman-202x300.png' },
      { name: 'Dr. Muhammad Rizwan', designation: 'associate_professor', title: 'Associate Professor (TTS)', email: 'muhammad.rizwan@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/09/Rizwan-profile-pic-150x150.jpeg' },
      { name: 'Dr. Wajid Khan', designation: 'assistant_professor', title: 'Assistant Professor', email: 'w.khan@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2022/06/wajid.khan_-138x150.png' },
      { name: 'Dr. Muhammad Suleman', designation: 'assistant_professor', title: 'Assistant Professor', email: 'suleman@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/01/IMG_0486-e1705396261692-150x150.jpg' },
      { name: 'Dr. Zafar Ali', designation: 'assistant_professor', title: 'Assistant Professor', email: 'zafar@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/Zafar-Ali_-002-e1621578610164-150x150.jpg' },
      { name: 'Dr. Arshad Iqbal', designation: 'assistant_professor', title: 'Assistant Professor of Biotechnology (TTS)', email: 'arshad.iqbal@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/Arshad-Iqbal-150x150.jpg' },
      { name: 'Mr. Ishaq Khan', designation: 'lecturer', title: 'Lecturer', photo: 'https://uswat.edu.pk/wp-content/uploads/2020/03/ishaq.png' },
      { name: 'Mr. Murad Ali', designation: 'lecturer', title: 'Lecturer', email: 'murad@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2020/03/murad.png' },
      { name: 'Dr. Sadia Akbar', designation: 'lecturer', title: 'Lecturer', roles: ['Gold Medalist'], email: 'sadia@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/04/WhatsApp-Image-2025-04-11-at-09.46.47-e1744347361177-150x150.jpeg' },
      { name: 'Dr. Murad Rahat', designation: 'assistant_professor', title: 'Assistant Professor (Fixed Pay)', email: 'muradrahat@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/07/Picture-2-150x150.jpg' },
    ],
  },
  'Department of Botany': {
    source: '/department-of-botany/',
    members: [
      { name: 'Dr. Hassan Sher', designation: 'professor', title: 'Professor', roles: ['(SAARC Gold Medalist)'], email: 'hassansher@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2020/02/HS-1-300x298.jpg' },
      { name: 'Dr. Ahmad Ali', designation: 'associate_professor', title: 'Associate Professor & Director', email: 'draali@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/WhatsApp-Image-2021-06-03-at-4.42.11-PM-150x150.jpeg', isHead: true },
      { name: 'Dr. Zahid Ullah', designation: 'associate_professor', title: 'Associate Professor', email: 'zahidtaxon@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2026/05/zahid-bot-150x150.png' },
      { name: 'Dr. Shazia Sakhi', designation: 'associate_professor', title: 'Associate Professor', email: 'shaziasakhi@uswat.edu.pk' },
      { name: 'Dr. Junaid Khan', designation: 'assistant_professor', title: 'Assistant Professor', email: 'khan.junaid@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/01/IMG_20240116_142108-e1705492191164-150x150.jpg' },
      // The page links zahidtaxon@uswat.edu.pk but shows zakia@uswat.edu.pk; the shown address is used.
      { name: 'Dr. Zakia Ahmad', designation: 'assistant_professor', title: 'Assistant Professor', email: 'zakia@uswat.edu.pk' },
      // E-mail not copied: the page gives shahidhussain@uswat.edu.pk, the address of Dr. Shahid Hussain listed below.
      { name: 'Dr. Muhammad Adil', designation: 'assistant_professor', title: 'Assistant Professor', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/dr_muhammad_adil-150x150.jpg' },
      { name: 'Dr. Shazia', designation: 'lecturer', title: 'Lecturer', email: 'shazia.dilbar@uswat.edu.pk' },
      { name: 'Dr. Shahid Hussain', designation: 'lecturer', title: 'Lecturer', email: 'shahidhussain@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/Shahid-Hussain-e1761894162883-150x150.jpeg' },
    ],
  },
  'Department of Chemistry': {
    source: '/department-of-chemistry/',
    members: [
      { name: 'Dr. Najeeb Ur Rehman', designation: 'professor', title: 'Professor', email: 'najeeb@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/01/WhatsApp-Image-2024-01-25-at-12.51.17-e1706263309704-150x150.jpeg' },
      { name: 'Dr. Fazal Mabood', designation: 'professor', title: 'Professor', email: 'fazal@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2021/04/fazal-150x150.jpg' },
      { name: 'Dr. Muhammad Omer', designation: 'associate_professor', title: 'Associate Professor & Chairman', qualification: ['Ph.D in Chemistry', '(Kyungpook National University (KNU), Daegu, South Korea)'], email: 'omarmarwat@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2020/05/Dr-M-Omer-pic-for-UoS-Website.jpg', isHead: true },
      { name: 'Dr. Ihsan Ullah', designation: 'associate_professor', title: 'Associate Professor', qualification: ['Ph.D in Chemistry', 'University of Rostock, Germany'], email: 'ihsanmtk@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2026/10/Dr.-Ihsan_Chem-150x150.jpeg' },
      { name: 'Dr. Adnan Shahzad', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['PhD in Inorganic Chemistry', 'University of Malakand'], email: 'adnanshahzad@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/07/picture-150x150.jpg' },
      { name: 'Dr. Adnan', designation: 'associate_professor', title: 'Associate Professor', qualification: ['Ph.D in Analytical Chemistry', 'University of Peshawar'], email: 'adnanchem@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/Dr.Adnan_.jpg' },
      { name: 'Dr. Main Gul Sayed', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['Ph.D in Organic Chemistry', 'University of Malakand'], email: 'mian@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/photo-jpg.jpg' },
      { name: 'Dr. Mohammad Sohail', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['Ph.D in Physical Chemistry', 'University of Peshawar'], email: 'msohail2000@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2022/05/sohail-chem-150x150.jpg' },
      { name: 'Dr. Imad Ud Din', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['Ph.D in Physical Chemistry'], email: 'imad.chem@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/07/15.02.2017-e1720082061285-150x150.jpg' },
      { name: 'Dr. Aziz Ahmad', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['Ph.D in Physical Chemistry'], email: 'azizahmad@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/09/Aziz-Picture-150x150.jpeg', googleScholarUrl: 'https://scholar.google.com/citations?user=HivQC7cAAAAJ&hl=en' },
      { name: 'Dr. Rahim Shah', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['PhD in New Energy Science and Engineering', 'University, China'], email: 'rahimshah@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/04/rahim_shah.jpg' },
    ],
  },
  'Department of Computer and Software Technology': {
    source: '/department-of-computer-and-software-technology/',
    members: [
      { name: 'Dr. Niamat Ullah', designation: 'professor', title: 'Professor', email: 'niamat@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/09/Niamat-Ullah-Professor-BPS-21-UoS-Picture-1.png' },
      { name: 'Dr. Sana Ullah', designation: 'professor', title: 'Professor and Chairman', qualification: ['Postdoc, GYEONGSANG National University South Korea (2019)', 'Postdoc, ISEP/INESC-TEC, Porto, Portugal (2015)', 'PhD (Wireless Networks), Inha University, South Korea (2011)'], email: 'sana@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/sanaullah-1.jpg', isHead: true },
      { name: 'Dr. Amjad Ali', designation: 'associate_professor', title: 'Associate Professor', email: 'amjad@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/DSCN0300.jpg' },
      { name: 'Dr. Kifayat Ullah', designation: 'assistant_professor', title: 'Assistant Professor', roles: ['MS Coordinator'], email: 'kifayat@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/04/Dr.-Kifayat-Ullah-150x150.jpg' },
      { name: 'Dr. Fazal Qudus Khan', designation: 'assistant_professor', title: 'Assistant Professor', email: 'fazal.qadus@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/09/WhatsApp-Image-2025-09-25-at-13.38.32-e1758792030847-150x150.jpeg' },
      { name: 'Mr. Kiramat Rahman', designation: 'assistant_professor', title: 'Assistant Professor', email: 'kiramat@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/10/kiramat.jpg' },
      { name: 'Mr. Fida Hussain', designation: 'assistant_professor', title: 'Assistant Professor', email: 'fida@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/Fida-Pic.jpg' },
      { name: 'Dr. Muzammil Khan', designation: 'assistant_professor', title: 'Assistant Professor', roles: ['HEC Approved PhD Supervisor'], qualification: ['PhD (Data Science and Text Processing)', 'Preston University Islamabad'], email: 'muzammil@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2021/02/WhatsApp-Image-2021-02-24-at-12.40.32-PM-150x150.jpeg' },
      { name: 'Mr. Umar Ali', designation: 'lecturer', title: 'Lecturer', qualification: ['MS Computer Science', '(Asian Institute of Technology, Thailand)'], email: 'umarali@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/Graduation.jpg' },
      { name: 'Mr. Naeem Ullah', designation: 'lecturer', title: 'Lecturer', email: 'naeem@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-01-at-12.50.05-150x150.jpeg' },
      { name: 'Dr. Usman Ali', designation: 'lecturer', title: 'Lecturer', email: 'usman@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-22-at-14.10.32-e1711349863678-150x150.jpeg' },
      { name: 'Mr. Abdul Haq', designation: 'lecturer', title: 'Lecturer', email: 'abdulhaq@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/09/Abdulhaq-e1758864901613-150x150.png' },
    ],
  },
  'Department of Economics and Development Studies': {
    source: '/department-of-economics-and-development-studies/',
    members: [
      { name: 'Dr. Anwar Hussain', designation: 'professor', title: 'Professor and DEAN', email: 'anwar@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/08/Anwar-Hussain-150x150.jpg' },
      { name: 'Dr. Umar Hayat', designation: 'professor', title: 'Professor and Chairman', email: 'umarhayat@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2026/01/Screenshot-3-e1767949243305-150x150.png', isHead: true },
      { name: 'Dr. Shahid Ali', designation: 'associate_professor', title: 'Associate Professor', roles: ['Gold Medalist'], email: 'shahid@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/12/WhatsApp-Image-2024-11-29-at-14.47.35-150x150.jpeg' },
      { name: 'Dr. Fazal Rabbi', designation: 'assistant_professor', title: 'Assistant Professor', email: 'rabbi.fazli@gmail.com', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/12/fr-e1733990219111-150x150.jpg' },
      { name: 'Dr. Muhammad Imad Khan', designation: 'lecturer', title: 'Lecturer', email: 'imad@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/12/395637343_358642223205555_6878200977664397541_n-e1733990139556-150x150.jpg' },
      { name: 'Mr. Jawad Mohammad', designation: 'lecturer', title: 'Lecturer', roles: ['Study Leave'], email: 'jawad@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/11/paspport-size-final-larg.jpg' },
      { name: 'Mr. Tariq Ziad Khwaja', designation: 'lecturer', title: 'Lecturer', email: 'tariqziad@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/04/tariq-ziad-150x150.webp' },
      { name: 'Dr. Naveed Ali', designation: 'lecturer', title: 'Lecturer', roles: ['Gold Medalist'], email: 'naveedali@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2020/02/1-1.jpg' },
    ],
  },
  'Department of English and Foreign Languages': {
    source: '/department-of-english-and-foreign-languages/',
    members: [
      { name: 'Dr. Syed Hanif Rasool', designation: 'associate_professor', title: 'Associate Professor & Chairman', email: 'syedhanifrasool@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/eng-o1-150x150.png', isHead: true },
      { name: 'Dr. Syed Shujaat Ali', designation: 'associate_professor', title: 'Associate Professor', email: 'shujaat@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/shujaat-ali-118x150-removebg-preview.png' },
      { name: 'Dr. Imdad Ullah Khan', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['PhD in Applied Linguistics', 'University of Auckland, Aotearoa New Zealand'], email: 'imdad.khan@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2020/08/Dr.-Imdad-Ullah-Photo-01-150x150.png' },
      { name: 'Mr. Zakirullah', designation: 'lecturer', title: 'Lecturer', qualification: ['M.Phil in English Literature'], email: 'zakirsalarkale@gmail.com', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/zakir-150x150-removebg-preview.png' },
      { name: 'Mr. Sadiq Hussain', designation: 'lecturer', title: 'Lecturer', email: 'sadiqhussain@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/SADIQ-150x150-removebg-preview.png' },
    ],
  },
  'Department of Environmental Sciences': {
    source: '/department-of-environmental-sciences/',
    members: [
      { name: 'Dr. Muhammad Qasim', designation: 'professor', title: 'Professor & Chairperson', roles: ['Pro Vice Chancellor'], qualification: ['PhD from the University of Leeds, UK', 'Post Doc (Hokkaido University Japan)'], email: 'drqasim@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2020/01/Prof-Dr-Qasim.jpg', isHead: true },
      { name: 'Dr. Javeed Nawab', designation: 'professor', title: 'Professor', email: 'jnawab@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/WhatsApp_Image_2025-10-02_at_10.32.12-removebg-preview-150x150.png' },
      { name: 'Dr. Kifayatullah Khan', designation: 'associate_professor', title: 'Associate Professor', qualification: ['PhD in Environmental Sciences', 'University of Peshawar'], email: 'drkhan@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/KK-Copy-removebg-preview-e1759735025336-150x150.png' },
      { name: 'Dr. Sanaullah', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['MS in Environmental Sciences', '(COMSATS University, Abbotabad, Pakistan)'], email: 'sanaullah@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/Mr.-Sanaullah-removebg-preview-e1759734860756-150x150.png' },
      // The page links sanaullah@uswat.edu.pk but shows khan.anwarzeb@uswat.edu.pk; the shown address is used.
      { name: 'Dr. Anwarzeb Khan', designation: 'assistant_professor', title: 'Assistant Professor', email: 'khan.anwarzeb@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/01/Dr.-Anwarzeb-Khan-150x150.jpg' },
      { name: 'Dr. Wajid Rashid', designation: 'lecturer', title: 'Lecturer', qualification: ['PhD in Environmental Sciences', '(Beijing Normal University, China)'], email: 'wajid@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/wajid-Rashid-removebg-preview-e1759734976721-150x150.png' },
      { name: 'Dr. Muhammad Ayaz', designation: 'lecturer', title: 'Lecturer', email: 'mayaz@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2026/08/Dr-Muhammad-Ayaz-Picture-150x150.jpg' },
      // Published as "Adjunct Faculty / Associate Professor / Shandong University, Jinan, China".
      { name: 'Dr. Khalil Ur Rahman', designation: 'visiting_faculty', title: 'Adjunct Faculty', roles: ['Associate Professor, Shandong University, Jinan, China'], photo: 'https://uswat.edu.pk/wp-content/uploads/2026/11/env001.png' },
    ],
  },
  'Department of Islamic and Arabic Studies': {
    source: '/department-of-islamic-and-arabic-studies/',
    members: [
      { name: 'Dr. Muhammad Mushtaq Ahmad', designation: 'associate_professor', title: 'Associate Professor', roles: ['Chairman'], qualification: ['PhD in Islamic Studies'], email: 'mushtaq@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/Dr.-Mushtaq-Ahmad-Assistant-Professor-Incharge-of-Department-150x150-removebg-preview.png', isHead: true },
      { name: 'Dr. Yahya Khan', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['PhD in Arabic literature'], email: 'yahya@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/Dr.-Yahya-Khan-Lecturer-150x150-removebg-preview.png' },
      { name: 'Dr. Javed Khan', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['PhD in Islamic Studies'], email: 'javedkhan@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/Dr.-Javed-Khan-Lecturer-150x150-1-e1759733549471.jpg' },
      { name: 'Dr. Muhammad Noman', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['PhD in Islamic Studies'], email: 'noman@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/Latest-Photo-of-Dr.-Muhammad-Noman-Assistant-Professor-e1759398022634-150x150-removebg-preview.png' },
      { name: 'Dr. Shafiqa Bushra', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['PhD in Arabic Literature'], email: 'shafiqbushra@uswat.edu.pk' },
      { name: 'Dr. Zia Ud Din', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['PhD in Islamic Studies (Seerat)'], email: 'zia@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/11/WhatsApp-Image-2025-11-24-at-14.28.36-150x150.jpeg' },
      { name: 'Dr. Fazle Haq', designation: 'lecturer', title: 'Lecturer', qualification: ['PhD in Islamic Studies (Seerat)'], email: 'fazlehaq@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/08/fazalHaq-e1722497329404-150x150.jpg' },
    ],
  },
  'Department of Law & Shariah': {
    source: '/department-of-law-sharia/',
    members: [
      { name: 'Mr. Amjad Hilal', designation: 'associate_professor', title: 'Associate Professor and Chairman', email: 'amjadhilal@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/amjadhilal-e1759136720703-removebg-preview-150x150.png', isHead: true },
      { name: 'Dr. Lutfullah Saqib', designation: 'professor', title: 'Professor', qualification: ['Post Doctorate (Islamic Law)', 'PhD (Islamic Law and Jurisprudence)', 'LLM(ICL) LLB(Hons)'], email: 'lutfullahsaqib@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/lutfullah-removebg-preview.png' },
      { name: 'Mr. Muhammad Islahuddin', designation: 'assistant_professor', title: 'Assistant Professor', email: 'm.islahuddin@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/09/isLah-e1759136834775-150x150.jpg' },
      { name: 'Mr. Qazi Ubaidullah', designation: 'assistant_professor', title: 'Assistant Professor', email: 'obaidullah@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/ubaid-150x150-removebg-preview.png' },
      { name: 'Ms. Nazish Inayat', designation: 'lecturer', title: 'Lecturer', email: 'nazish@uswat.edu.pk' },
      { name: 'Ms. Kalsoom Bibi', designation: 'lecturer', title: 'Lecturer', email: 'kalsoom@uswat.edu.pk' },
    ],
  },
  'Department of Management & Commerce': {
    source: '/department-of-management-commerce/',
    members: [
      { name: 'Dr. Hazrat Bilal', designation: 'professor', title: 'Director / Professor', qualification: ['PhD in Management Sciences'], email: 'hbilal@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/01/WhatsApp-Image-2024-01-05-at-00.09.51_4a968e7e-150x150.jpg', isHead: true },
      { name: 'Dr. Nasir Shaheen', designation: 'associate_professor', title: 'Associate Professor', qualification: ['PhD in Management Sciences'], email: 'nasirshaheen@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/picture-150x150.jpeg' },
      { name: 'Dr. Muhammad Tariq', designation: 'associate_professor', title: 'Associate Professor', qualification: ['PhD in Management Sciences'], email: 'muhammadtariq@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2023/11/tariq.jpg' },
      { name: 'Dr. Lala Rukh', designation: 'associate_professor', title: 'Associate Professor in Finance', qualification: ['PhD in Management Sciences'], email: 'lalarukh@uswat.edu.pk' },
      { name: 'Dr. Badshah Hussain', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['PhD in Management Sciences'], email: 'badshah@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/01/Dr-Badshah-Hussain-150x150.jpg' },
      { name: 'Dr. Jawad Karamat', designation: 'assistant_professor', title: 'Assistant Professor', roles: ['Gold Medalist'], qualification: ['PhD in Management Sciences'], email: 'jkaramat@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/02/Jawad-Pic-e1707721011217-150x150.jpg' },
      { name: 'Dr. Abdul Mateen', designation: 'lecturer', title: 'Lecturer in Human Resource Management', qualification: ['PhD in Management Sciences'], email: 'abdulmateen@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/mateen-1-150x150.jpg' },
      { name: 'Dr. Neelam Akbar Marwat', designation: 'lecturer', title: 'Lecturer in Marketing', email: 'neelammarwat@uswat.edu.pk' },
      { name: 'Mr. Khursheed Ahmad', designation: 'lecturer', title: 'Lecturer in Finance', qualification: ['PhD in Progress'], email: 'khursheed@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/DSC00728-e1622543592209-150x113.jpg' },
      { name: 'Dr. Mohammad Sohail', designation: 'lecturer', title: 'Lecturer in Finance', email: 'm.sohail@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/dp1-e1622007151917-150x143.jpg' },
      { name: 'Dr. Sangeen Khan', designation: 'lecturer', title: 'Lecturer in Human Resource', email: 'drsangeen@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/11/unnamed-150x150.jpg' },
    ],
  },
  'Department of Mathematics and Statistics': {
    source: '/department-of-mathematics-and-statistics/',
    members: [
      { name: 'Dr. Faiz Muhammad Khan', designation: 'associate_professor', title: 'Associate Professor & Chairman', qualification: ['Post Doctorate (Mathematics)'], email: 'drfaiz@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/04/WhatsApp-Image-2024-04-22-at-9.11.01-AM-150x150.jpeg', isHead: true },
      { name: 'Dr. Ghaus ur Rahman', designation: 'associate_professor', title: 'Associate Professor of Mathematics', qualification: ['Post Doctorate (University of Oslo, Norway)', 'PhD (Mathematics, Abdus Salam School, GCU)', 'M.Sc. (Mathematics, Gold Medalist)'], email: 'dr.ghaus@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/01/Dr.Ghaus-Photo-150x150.jpeg' },
      { name: 'Dr. Amir Khan', designation: 'assistant_professor', title: 'Assistant Professor of Mathematics', email: 'amirkhan@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/01/Dr.-Amir-Photo-e1737625543134-150x150.jpeg' },
      { name: 'Dr. Iftikhar Ahmed', designation: 'assistant_professor', title: 'Assistant Professor of Mathematics', email: 'iftikhar@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/01/Dr.-Iftikhar-Photo-150x150.jpeg' },
      { name: 'Dr. Gohar Ayub', designation: 'assistant_professor', title: 'Assistant Professor of Statistics', email: 'goharayub@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2026/10/WhatsApp-Image-2026-10-15-at-15.38.32-150x150.jpeg' },
      { name: 'Dr. Amjad Ali', designation: 'assistant_professor', title: 'Assistant Professor of Mathematics', roles: ['Gold Medalist'], email: 'amjadali@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/Amjad-Ali-Picture-150x150.jpeg' },
      { name: 'Dr. Mahrukh Anum', designation: 'lecturer', title: 'Lecturer in Statistics', email: 'mahrukhanum@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2023/04/WhatsApp-Image-2023-04-17-at-11.32.45-PM-150x150.jpeg' },
      { name: 'Dr. Asaf Khan', designation: 'lecturer', title: 'Lecturer in Mathematics', roles: ['Gold Medalist'], email: 'asafkhan@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/Asaf-Khan-Picture-1-150x150.jpg' },
      { name: 'Mr. Imran Ullah', designation: 'lecturer', title: 'Lecturer in Statistics', email: 'imranstat@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/01/Imran-Photo-150x150.jpg' },
    ],
  },
  'Department of Media and Communication Studies': {
    source: '/department-of-media-and-communication-studies/',
    members: [
      { name: 'Dr. Jamal ud Din', designation: 'associate_professor', title: 'Associate Professor', roles: ['Chairman'], email: 'jamaluddin@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2022/07/Jamal-pic-150x150.jpg', isHead: true },
      { name: 'Dr. Rafi Ullah', designation: 'lecturer', title: 'Lecturer/Station Manager/PRO', email: 'rafiullah@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2022/07/WhatsApp-Image-2022-07-22-at-12.14.49-PM-150x149.jpeg' },
      { name: 'Mr. Khayam Hassan', designation: 'lecturer', title: 'Lecturer (on study leave)', email: 'Khayam@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2023/05/Khayam-Hassan-150x150.jpg' },
      { name: 'Ms. Sadia Younus', designation: 'lecturer', title: 'Lecturer (on study leave)', email: 'sadiayounus@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2023/05/Sadia-150x150.jpg' },
      { name: 'Mr. Khalid Khan', designation: 'assistant_professor', title: 'Assistant Professor (on study leave)', email: 'khalid.khan@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2023/05/Khalid-150x150.jpg' },
    ],
  },
  'Department of Pashto and Local Languages': {
    source: '/department-of-pashto/',
    members: [
      // The Pashto page gives only "In-charge"; designation from his entry on the Media and Communication Studies page.
      { name: 'Dr. Rafi Ullah', designation: 'lecturer', roles: ['In-charge'], email: 'rafiullah@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2022/07/WhatsApp-Image-2022-07-22-at-12.14.49-PM-150x149.jpeg', isHead: true },
    ],
  },
  'Department of Psychological Studies': {
    source: '/department-of-psychological-studies/',
    members: [
      { name: 'Ms.Palwasha Rahim', designation: 'lecturer', title: 'Lecturer/In-Charge', email: 'palwasharahim@uswat.edu.pk', isHead: true },
      { name: 'Dr. Faheem Ud Din', designation: 'lecturer', title: 'Lecturer', email: 'faheem@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2023/09/Faheem-2023-e1694064044187-150x150.jpg' },
      { name: 'Ms. Roya Shahhiman Zada', designation: 'lecturer', title: 'Lecturer', roles: ['on study Leave', 'Gold medalist'], email: 'royashahhiman@uswat.edu.pk' },
    ],
  },
  'Department of Social and Gender Studies': {
    source: '/department-of-social-and-gender-studies/',
    members: [
      { name: 'Dr. Ihsan Ullah Khan', designation: 'assistant_professor', title: 'Assistant Professor in Sociology', roles: ['In-charge'], qualification: ['PhD in Sociology (Sociology of Crime)', 'University of Peshawar'], email: 'ihsanullah@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2023/04/Ihsan-Pic-1-150x150.jpg', isHead: true },
      { name: 'Dr. Sheraz Ali', designation: 'assistant_professor', title: 'Assistant Professor in Sociology', qualification: ['PhD in Sociology, University of Malakand'], email: 'sheraz@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/WhatsApp-Image-2021-12-29-at-3.02.49-PM.jpeg' },
      { name: 'Dr. Imran', designation: 'assistant_professor', title: 'Assistant Professor in Sociology', roles: ['Gold Medalist'], qualification: ['PhD in Sociology, University of Peshawar'], email: 'imran_sociologist@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/WhatsApp-Image-2020-10-11-at-3.00.41-PM-e1622632499632-133x150.jpeg' },
      { name: 'Dr. Abdullah', designation: 'assistant_professor', title: 'Assistant Professor in Social Work', qualification: ['PhD in Social Work, University of Peshawar'], photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/pp-e1622713356233-150x149.jpg' },
      { name: 'Dr. Muhammad Asghar Khan', designation: 'assistant_professor', title: 'Assistant Professor in Sociology', roles: ['Gold Medalist'], qualification: ['PhD in Sociology, University of Malakand'], email: 'asgharsocio@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/Soc1-228x300-e1622632583136-150x150.jpg' },
    ],
  },
  'Department of Tourism and Hospitality': {
    source: '/department-of-tourism-and-hospitality/',
    members: [
      { name: 'Dr. Aatif Iqbal', designation: 'assistant_professor', title: 'Assistant Professor & In-charge', roles: ['Gold Medalist'], qualification: ['Ph.D in Tourism', 'School of Business and Economics, Universiti Putra Malaysia'], email: 'aatif@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/01/Aatifs-Pic-e1705903764822-150x150.jpg', isHead: true },
      { name: 'Mr. Farhad Nazir', designation: 'lecturer', title: 'Lecturer', roles: ['Gold Medalist'], qualification: ['M.A in Tourism and Hospitality)', '(Hazara University, Mansehra)'], email: 'farhad@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/08/IMG_20220603_111821-1-1-150x150.jpg' },
    ],
  },
  'Department of Zoology': {
    source: '/department-of-zoology/',
    members: [
      { name: 'Dr. Akhar Rasool', designation: 'assistant_professor', title: 'Assistant Professor', roles: ['In-Charge'], email: 'arasool@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2022/06/dr-150x150.png', isHead: true },
      { name: 'Dr. Tanzil Ur Rahman', designation: 'assistant_professor', title: 'Assistant Professor', email: 'trahman@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/01/WhatsApp-Image-2024-01-18-at-3.20.47-PM-150x150.jpeg' },
      { name: 'Dr. Ghulam Nabi', designation: 'assistant_professor', title: 'Assistant Professor', email: 'gnabi@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/10/Photo-150x150.jpg' },
      { name: 'Dr. Naseer Ullah', designation: 'lecturer', title: 'Lecturer', email: 'naseer@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/ns-150x150.jpg' },
      { name: 'Ms. Rohi Naz', designation: 'lecturer', title: 'Lecturer', qualification: ['M.Phil Zoology'] },
      { name: 'Ms. Shabnam', designation: 'lecturer', title: 'Lecturer' },
      { name: 'Dr. Muhammad Yousaf', designation: 'assistant_professor', title: 'Assistant Professor (Fixed Pay)', email: 'dyousaf@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2023/02/WhatsApp-Image-2023-02-22-at-1.40.08-PM-150x150.jpeg' },
    ],
  },
  'Department of Education and Staff Training': {
    source: '/department_of_education_and_staff_training/',
    members: [
      { name: 'Dr. Nasir Ahmad', designation: 'associate_professor', title: 'Associate Professor', roles: ['Director'], qualification: ['PhD in Education'], email: 'nasir_cupid@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2020/05/DrNasir_Ahmad-150x150.jpg', googleScholarUrl: 'https://scholar.google.com/citations?user=kn3xL2MAAAAJ&hl=en&authuser=1', isHead: true },
      { name: 'Dr. Farooq Nawaz Khan', designation: 'associate_professor', title: 'Associate Professor', qualification: ['PhD in Education'], email: 'farooq@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/WhatsApp-Image-2021-06-02-at-6.19.23-PM-e1622712293310-150x150.jpeg' },
      { name: 'Dr. Sajjad Hussain', designation: 'associate_professor', title: 'Associate Professor', qualification: ['PhD in Education (Assessment)'], email: 'sajjadhussain@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/09/Dr.-Sajjad-Hussain-e1759208971642-150x147.jpeg' },
      { name: 'Dr. Maryam Imad', designation: 'lecturer', title: 'Lecturer', qualification: ['PhD in Education'], email: 'maryam@uswat.edu.pk' },
      { name: 'Dr. Alam Zeb', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['PhD in Education'], email: 'alamzeb@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/09/Dr.-Alam-Zeb-150x150.jpeg' },
      { name: 'Ms. Sadarat', designation: 'lecturer', title: 'Lecturer', qualification: ['PhD Scholar'], email: 'sadarat@uswat.edu.pk' },
    ],
  },
  'Department of Geology': {
    source: '/department_of_geology/',
    members: [
      { name: 'Dr. Zaheen Ullah', designation: 'assistant_professor', title: 'Assistant Professor', email: 'zaheen.ullah@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2024/02/WhatsApp-Image-2024-02-22-at-13.40.45-150x150.jpeg' },
      { name: 'Mr. Adnan Khan', designation: 'lecturer', title: 'In-charge & Lecturer', email: 'adnankhan@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/WhatsApp-Image-2021-06-11-at-11.43.08-AM-e1623730973830-150x150.jpeg', isHead: true },
      { name: 'Mr. Muhammad Ibrar', designation: 'lecturer', title: 'Lecturer', email: 'mibrar@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2020/10/M.Ibrar-Pic-150x150.jpg' },
      { name: 'Dr. Subhan Ullah', designation: 'lecturer', title: 'Lecturer', email: 'subhan@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2026/01/Subhan-Ullah-Passport-size-pic--150x150.jpeg' },
      { name: 'Mr. Muhammad Idrees', designation: 'lecturer', title: 'Lecturer', email: 'idrees@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/WhatsApp-Image-2021-06-15-at-1.10.44-PM-e1623755707168-150x145.jpeg' },
    ],
  },
  'Department of Pakistan Studies': {
    source: '/department_of_pakistan_studies/',
    members: [
      { name: 'Dr. Sarfaraz Khan', designation: 'assistant_professor', title: 'Assistant Professor & In-charge', qualification: ['PhD in Asian Studies'], email: 'sarfarazkhan@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/pp-5-150x150.jpg', isHead: true },
      { name: 'Mr. Zahid Nasir', designation: 'lecturer', title: 'Lecturer', email: 'zahidnasir@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2023/03/zn-150x150.jpg' },
    ],
  },
  'Department of Physics': {
    source: '/department_of_physics/',
    members: [
      { name: 'Dr. Kefayat Ullah', designation: 'associate_professor', title: 'Associate Professor/Chairman', qualification: ['PhD in Graphene Based Nanomaterials', 'Department of Advanced Materials Science & Engineering', 'Hanseo University, South Korea'], email: 'kefsayed@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2022/09/kifayat-150x150.jpeg', googleScholarUrl: 'https://scholar.google.com/citations?hl=en&user=bSFoVl4AAAAJ', isHead: true },
      { name: 'Dr. Amin Ur Rashid', designation: 'associate_professor', title: 'Associate Professor', qualification: ['PhD in Physics'], email: 'amin_physics@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/WhatsApp-Image-2021-06-03-at-1.34.34-PM-e1622711798451-150x150.jpeg' },
      { name: 'Dr. Fazli Hadi', designation: 'associate_professor', title: 'Associate Professor', qualification: ['PhD in Physics', 'University of Peshawar'], email: 'hadiphysics@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2019/09/WhatsApp-Image-2021-06-03-at-1.34.47-PM-e1622711879133-150x150.jpeg' },
      { name: 'Dr. Salah Uddin', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['PhD in Physics', 'City University of Hong Kong'], photo: 'https://uswat.edu.pk/wp-content/uploads/2022/10/Dr.-Salah-Uddin-Pic-150x150.png' },
      { name: 'Dr. Rafi ud Din', designation: 'assistant_professor', title: 'Assistant Professor', qualification: ['PhD in Physics (Quantum)', 'Huazhong University of Science and Technology'], email: 'rafiuddin@uswat.edu.pk', photo: 'https://uswat.edu.pk/wp-content/uploads/2025/09/11-e1758609573745-150x150.jpg' },
    ],
  },
};

/** Photo URLs to try, best first: the WordPress original (no -WxH thumbnail suffix), then the file the page shows. */
export function photoCandidates(listed: string): string[] {
  return [...new Set([listed.replace(/-\d+x\d+(?=\.\w+$)/, ''), listed])];
}
