// Recommendation Library (TD-17) — derived from EVALUATION_FRAMEWORK.md §6.8–13.8 trigger tables (approved).
// Entries are selected deterministically (select.ts); AI may only personalise wording.
import type { Answers } from "../questions/types";
import type { DimensionResult, FlagKey } from "../scoring/types";

export type RecType = "performance" | "evidence" | "information";

export interface RecText {
  title: string;
  weakness: string;
  why: string;
  action: string;
  steps: string[];
  evidence: string[];
}

export interface LibEntry {
  key: string;
  criterion: string;
  dimension: "commercial" | "social";
  type: RecType;
  relatedQuestions: string[];
  relatedFlags?: FlagKey[];
  when: (d: DimensionResult, a: Answers) => boolean;
  ar: RecText;
  en: RecText;
}

const sc = (d: DimensionResult) => d.score ?? 99;
const has = (d: DimensionResult, f: FlagKey) => d.flags.includes(f);
const ans = (a: Answers, q: string, ...opts: number[]) => opts.includes(a[q]);
const lowConf = (d: DimensionResult) => d.status === "scored" && (d.confidence === "StatementOnly" || d.confidence === "Low");

export const LIBRARY: LibEntry[] = [
  // ===== C1 Large Market =====
  {
    key: "C1-COM-PAYER", criterion: "C1", dimension: "commercial", type: "information", relatedQuestions: ["C1-Q1"], relatedFlags: ["payer_not_identified"],
    when: (d, a) => ans(a, "C1-Q1", 4, 5),
    en: { title: "Identify the primary paying group", weakness: "It is not clear who will pay for the product or service.", why: "Market size and the revenue model depend on who pays.", action: "Rank possible payer groups and validate willingness to pay with the top group.", steps: ["List each group that could pay and what they would pay for.", "Interview at least a small sample of the top group about price and need.", "Record which group is primary and why."], evidence: ["Interview or survey records", "Letters of intent", "First sales to the primary group"] },
    ar: { title: "حدِّد الفئة الأساسية التي ستدفع", weakness: "ليس واضحاً من سيدفع مقابل المنتج أو الخدمة.", why: "حجم السوق ونموذج الإيرادات يعتمدان على من يدفع.", action: "رتِّب الفئات التي يمكن أن تدفع وتحقَّق من استعداد الفئة الأولى للدفع.", steps: ["اكتب كل فئة يمكن أن تدفع وما الذي ستدفع مقابله.", "قابل عينة من الفئة الأولى عن السعر والاحتياج.", "سجِّل أي فئة هي الأساسية ولماذا."], evidence: ["سجلات مقابلات أو استبيان", "خطابات نوايا", "أول مبيعات للفئة الأساسية"] },
  },
  {
    key: "C1-COM-SMALL", criterion: "C1", dimension: "commercial", type: "performance", relatedQuestions: ["C1-Q1", "C1-Q2"],
    when: (d, a) => d.status === "scored" && sc(d) <= 3 && ans(a, "C1-Q1", 0, 4),
    en: { title: "Grow the paying market", weakness: "The estimated number of potential paying customers in the target area is small.", why: "A small consumer market limits revenue and the ability to cover costs.", action: "Consider widening the geographic scope or adding paying groups, only where this stays consistent with the social mission.", steps: ["Identify neighbouring areas or paying organisations that face the same need.", "Estimate potential customers for the wider scope with a stated method.", "Check that serving them does not divert the project from its beneficiaries."], evidence: ["Revised estimate for the new scope with sources", "Early sales or enquiries from the new scope"] },
    ar: { title: "وسِّع السوق الذي يدفع", weakness: "العدد المقدَّر للعملاء المحتملين الذين يدفعون في المنطقة المستهدفة صغير.", why: "السوق الاستهلاكي الصغير يحدّ من الإيرادات ومن القدرة على تغطية التكاليف.", action: "فكِّر في توسيع النطاق الجغرافي أو إضافة فئات تدفع، بشرط أن يظل ذلك متسقاً مع الرسالة الاجتماعية.", steps: ["حدِّد مناطق مجاورة أو جهات تدفع وتواجه الاحتياج نفسه.", "قدِّر عدد العملاء المحتملين للنطاق الأوسع بطريقة موضحة.", "تأكد أن خدمتهم لا تبعد المشروع عن المستفيدين."], evidence: ["تقدير معدّل للنطاق الجديد مع المصادر", "مبيعات أو استفسارات أولية من النطاق الجديد"] },
  },
  {
    key: "C1-COM-SALESONLY", criterion: "C1", dimension: "commercial", type: "evidence", relatedQuestions: ["C1-EF"],
    when: (d, a) => d.status === "scored" && a["C1-EF"] === 4,
    en: { title: "Estimate market size, not only sales", weakness: "Actual sales show that demand exists but do not measure the size of the market.", why: "Growth decisions need an estimate of how many potential customers exist.", action: "Supplement sales data with a documented market estimate for the target area.", steps: ["Define who counts as a potential customer.", "Count or estimate them in the target area using a stated source.", "Compare the estimate with current sales."], evidence: ["Market estimate with sources and method"] },
    ar: { title: "قدِّر حجم السوق وليس المبيعات فقط", weakness: "المبيعات الفعلية تثبت وجود طلب لكنها لا تقيس حجم السوق.", why: "قرارات النمو تحتاج تقديراً لعدد العملاء المحتملين.", action: "أضف إلى بيانات المبيعات تقديراً موثقاً لحجم السوق في المنطقة المستهدفة.", steps: ["حدِّد من يُعتبر عميلاً محتملاً.", "احسب أو قدِّر عددهم في المنطقة المستهدفة من مصدر محدد.", "قارن التقدير بالمبيعات الحالية."], evidence: ["تقدير للسوق مع المصادر والطريقة"] },
  },
  {
    key: "C1-COM-EVID", criterion: "C1", dimension: "commercial", type: "evidence", relatedQuestions: ["C1-Q2", "C1-EF"],
    when: (d) => lowConf(d),
    en: { title: "Support the customer estimate with evidence", weakness: "The potential-customer estimate rests on an impression or personal observation.", why: "Decisions based on unverified sizes are risky; weak evidence does not mean the market is small, only that it is unproven.", action: "Run structured interviews or a survey with the target group, or obtain published data for the target area.", steps: ["Choose a method (survey, interviews, published statistics).", "Collect data in the target area and record the sample and date.", "Attach the results and update the estimate."], evidence: ["Survey method and results", "Published figures with source and year"] },
    ar: { title: "ادعم تقدير العملاء بأدلة", weakness: "تقدير العملاء المحتملين مبني على انطباع أو ملاحظة شخصية.", why: "القرارات المبنية على أحجام غير مثبتة فيها مخاطرة؛ وضعف الدليل لا يعني أن السوق صغير، بل أنه غير مثبت.", action: "أجرِ مقابلات منظمة أو استبياناً مع الفئة المستهدفة، أو احصل على بيانات منشورة للمنطقة المستهدفة.", steps: ["اختر طريقة (استبيان، مقابلات، إحصاءات منشورة).", "اجمع البيانات في المنطقة المستهدفة وسجِّل العينة والتاريخ.", "أرفق النتائج وحدِّث التقدير."], evidence: ["طريقة الاستبيان ونتائجه", "أرقام منشورة مع المصدر والسنة"] },
  },
  {
    key: "C1-SOC-GROUP", criterion: "C1", dimension: "social", type: "information", relatedQuestions: ["C1-Q3"], relatedFlags: ["beneficiary_group_not_defined"],
    when: (d, a) => ans(a, "C1-Q3", 6, 7),
    en: { title: "Define the primary beneficiary group", weakness: "The group facing the problem is not defined.", why: "A need cannot be sized, nor impact measured, without a defined group.", action: "Define the primary beneficiary group by characteristics and location.", steps: ["Describe who faces the problem (age, gender, situation, location).", "Check the definition with people from the group.", "Use the same definition for all estimates."], evidence: ["Written definition", "Field notes or data on the group"] },
    ar: { title: "حدِّد الفئة المستفيدة الأساسية", weakness: "الفئة التي تواجه المشكلة غير محددة.", why: "لا يمكن تقدير الاحتياج أو قياس الأثر دون فئة محددة.", action: "حدِّد الفئة المستفيدة الأساسية بخصائصها ومكانها.", steps: ["صِف من يواجه المشكلة (العمر، النوع، الوضع، المكان).", "راجع التعريف مع أشخاص من الفئة نفسها.", "استخدم التعريف نفسه في كل التقديرات."], evidence: ["تعريف مكتوب", "ملاحظات أو بيانات ميدانية عن الفئة"] },
  },
  {
    key: "C1-SOC-SMALL", criterion: "C1", dimension: "social", type: "performance", relatedQuestions: ["C1-Q4"],
    when: (d) => d.status === "scored" && sc(d) <= 3,
    en: { title: "Document how serious and widespread the need is", weakness: "The estimated number of people affected in the target area is small.", why: "Need size limits impact scale; in a small area a small number can still be a large share or a severe problem, which only evidence can show.", action: "Collect evidence on the prevalence and severity of the problem in the target area, or check whether the scope is drawn too narrowly.", steps: ["Obtain the official population of the target area.", "Collect evidence on how many are affected and how severely.", "Reconsider the target scope if the need extends beyond it."], evidence: ["Official population figure with source", "Prevalence or severity data", "Revised scope"] },
    ar: { title: "وثِّق مدى انتشار الاحتياج وشدته", weakness: "العدد المقدَّر للمتأثرين بالمشكلة في المنطقة المستهدفة صغير.", why: "حجم الاحتياج يحدّ من حجم الأثر؛ وفي منطقة صغيرة قد يمثل عدد صغير نسبة كبيرة أو مشكلة شديدة، ولا يثبت ذلك إلا الدليل.", action: "اجمع أدلة على انتشار المشكلة وشدتها في المنطقة المستهدفة، أو راجع إن كان النطاق ضيقاً أكثر من اللازم.", steps: ["احصل على عدد السكان الرسمي للمنطقة المستهدفة.", "اجمع أدلة على عدد المتأثرين ودرجة التأثر.", "أعد النظر في النطاق إن كان الاحتياج يمتد خارجه."], evidence: ["رقم السكان الرسمي مع المصدر", "بيانات الانتشار أو الشدة", "نطاق معدّل"] },
  },
  {
    key: "C1-SOC-EVID", criterion: "C1", dimension: "social", type: "evidence", relatedQuestions: ["C1-Q4", "C1-EF"],
    when: (d) => lowConf(d),
    en: { title: "Support the need estimate with sourced data", weakness: "The number of people affected is not supported by sourced data.", why: "Impact claims need a verifiable picture of the need; the platform will not assume a size.", action: "Obtain published statistics for the target area (for example from the national statistics office) or collect field data.", steps: ["Find official or published data on the affected group for your area.", "If none exists, run a small field survey and record the method.", "Attach the source with its year and area."], evidence: ["Published statistics with source", "Field survey method and results"] },
    ar: { title: "ادعم تقدير الاحتياج ببيانات من مصادر", weakness: "عدد المتأثرين غير مدعوم ببيانات من مصادر محددة.", why: "ادعاءات الأثر تحتاج صورة يمكن التحقق منها عن الاحتياج؛ والمنصة لا تفترض أي حجم.", action: "احصل على إحصاءات منشورة للمنطقة المستهدفة (مثل جهاز الإحصاء الوطني) أو اجمع بيانات ميدانية.", steps: ["ابحث عن بيانات رسمية أو منشورة عن الفئة المتأثرة في منطقتك.", "إن لم توجد، نفِّذ مسحاً ميدانياً صغيراً وسجِّل الطريقة.", "أرفق المصدر مع السنة والمنطقة."], evidence: ["إحصاءات منشورة مع المصدر", "طريقة المسح الميداني ونتائجه"] },
  },
  // ===== C2 High Gross Margins =====
  {
    key: "C2-COM-MARGIN", criterion: "C2", dimension: "commercial", type: "performance", relatedQuestions: ["C2-Q1"],
    when: (_d, a) => ans(a, "C2-Q1", 2, 3, 4),
    en: { title: "Improve the gross margin", weakness: "The selling price is close to, or below, the direct cost.", why: "Each sale funds little or loses money, so the enterprise cannot cover its costs from sales.", action: "Review the price (test willingness to pay) and reduce direct costs per unit.", steps: ["List every direct cost per unit with its source.", "Test a revised price with a small group of customers.", "Look for savings in inputs, waste, or batch size."], evidence: ["Revised unit cost sheet", "Price-test results", "Sales at the revised price"] },
    ar: { title: "حسِّن هامش الربح الإجمالي", weakness: "سعر البيع قريب من التكلفة المباشرة أو أقل منها.", why: "كل عملية بيع تموّل القليل أو تخسر، فلا يستطيع المشروع تغطية تكاليفه من المبيعات.", action: "راجع السعر (اختبر استعداد العملاء للدفع) وخفِّض التكلفة المباشرة للوحدة.", steps: ["اكتب كل تكلفة مباشرة للوحدة ومصدرها.", "اختبر سعراً معدلاً مع مجموعة صغيرة من العملاء.", "ابحث عن توفير في الخامات أو الهدر أو حجم الدفعة."], evidence: ["جدول تكلفة وحدة معدّل", "نتائج اختبار السعر", "مبيعات بالسعر المعدّل"] },
  },
  {
    key: "C2-COM-OVERHEAD", criterion: "C2", dimension: "commercial", type: "performance", relatedQuestions: ["C2-Q2"], relatedFlags: ["overheads_or_volume"],
    when: (d) => has(d, "overheads_or_volume"),
    en: { title: "Make the margin cover running costs", weakness: "The margin per sale is positive but does not cover running expenses.", why: "This points to high fixed costs or low sales volume, not to the margin itself.", action: "Reduce fixed costs or plan the sales volume needed to cover them.", steps: ["List monthly fixed expenses.", "Calculate the sales volume needed to cover them at the current margin.", "Decide which costs to cut or how to reach the volume."], evidence: ["Monthly expense budget", "Volume plan", "Sales records"] },
    ar: { title: "اجعل الهامش يغطي المصروفات التشغيلية", weakness: "الهامش لكل عملية بيع موجب لكنه لا يغطي المصروفات الجارية.", why: "يشير ذلك إلى تكاليف ثابتة مرتفعة أو حجم مبيعات منخفض، لا إلى الهامش نفسه.", action: "خفِّض التكاليف الثابتة أو خطِّط لحجم المبيعات اللازم لتغطيتها.", steps: ["اكتب المصروفات الثابتة الشهرية.", "احسب حجم المبيعات اللازم لتغطيتها بالهامش الحالي.", "قرِّر أي التكاليف تُخفَّض أو كيف تصل إلى الحجم المطلوب."], evidence: ["ميزانية المصروفات الشهرية", "خطة حجم المبيعات", "سجلات المبيعات"] },
  },
  {
    key: "C2-COM-GRANT", criterion: "C2", dimension: "commercial", type: "performance", relatedQuestions: ["C2-Q1", "C2-Q2"], relatedFlags: ["grant_dependent"],
    when: (d) => has(d, "grant_dependent"),
    en: { title: "Build a path to commercial self-funding", weakness: "Costs are currently covered partly by grants or donations while the commercial margin is weak.", why: "Grants can supplement revenue, but they are not proof of a profitable, sustainable business model.", action: "Plan how commercial revenue will cover costs, keeping grants as a supplement only.", steps: ["Separate commercial revenue from grant income in your figures.", "Project when commercial revenue alone will cover costs.", "List the price, cost, or volume changes needed to get there."], evidence: ["Projection showing commercial coverage of costs", "Accounts separating grants from sales"] },
    ar: { title: "ابنِ مساراً للتمويل الذاتي التجاري", weakness: "التكاليف تُغطّى حالياً جزئياً بمنح أو تبرعات بينما الهامش التجاري ضعيف.", why: "المنح يمكن أن تكمّل الإيرادات، لكنها ليست دليلاً على نموذج عمل مربح ومستدام.", action: "خطِّط لكيفية تغطية الإيرادات التجارية للتكاليف، مع إبقاء المنح مكمّلاً فقط.", steps: ["افصل الإيرادات التجارية عن المنح في أرقامك.", "توقَّع متى ستغطي الإيرادات التجارية وحدها التكاليف.", "حدِّد تغييرات السعر أو التكلفة أو الحجم اللازمة لذلك."], evidence: ["توقعات توضح تغطية الإيرادات التجارية للتكاليف", "حسابات تفصل المنح عن المبيعات"] },
  },
  {
    key: "C2-COM-EVID", criterion: "C2", dimension: "commercial", type: "evidence", relatedQuestions: ["C2-Q1", "C2-Q2"],
    when: (d) => lowConf(d),
    en: { title: "Document your unit economics", weakness: "Price, cost, and coverage claims are not supported by documents.", why: "Profitability is a mandatory objective; it needs figures that can be checked.", action: "Attach a unit cost sheet, recent sales prices, and supplier invoices.", steps: ["Prepare a cost sheet per unit with sources.", "Attach recent invoices for sales and inputs.", "Keep grants separate from sales."], evidence: ["Unit cost sheet", "Sales and supplier invoices", "Operating budget"] },
    ar: { title: "وثِّق اقتصاديات الوحدة", weakness: "ادعاءات السعر والتكلفة والتغطية غير مدعومة بمستندات.", why: "الربحية هدف إلزامي، وتحتاج أرقاماً يمكن التحقق منها.", action: "أرفق جدول تكلفة الوحدة وأسعار البيع الحديثة وفواتير الموردين.", steps: ["أعدّ جدول تكلفة للوحدة مع المصادر.", "أرفق فواتير حديثة للمبيعات والخامات.", "افصل المنح عن المبيعات."], evidence: ["جدول تكلفة الوحدة", "فواتير المبيعات والموردين", "الموازنة التشغيلية"] },
  },
  {
    key: "C2-SOC-FAIR", criterion: "C2", dimension: "social", type: "performance", relatedQuestions: ["C2-Q3", "C2-Q4"],
    when: (d) => d.status === "scored" && sc(d) >= 2 && sc(d) <= 3,
    en: { title: "Make beneficiary income fair for the effort", weakness: "Beneficiaries' expected income is limited compared with their time and effort.", why: "Fair income is part of the social value; a profitable enterprise does not automatically pay beneficiaries fairly.", action: "Revisit the pay rate, reduce effort per unit with tools or process changes, or share margin.", steps: ["Measure time and cost per unit for beneficiaries.", "Compare pay with that time and cost.", "Test a changed rate or process with a few beneficiaries."], evidence: ["Payment records", "Time logs before and after"] },
    ar: { title: "اجعل دخل المستفيد عادلاً مقابل المجهود", weakness: "الدخل المتوقع للمستفيدين محدود مقارنة بوقتهم ومجهودهم.", why: "الدخل العادل جزء من القيمة الاجتماعية؛ والمشروع المربح لا يدفع للمستفيدين بعدالة تلقائياً.", action: "راجع أجر الوحدة، أو قلِّل المجهود لكل وحدة بأدوات أو تحسين طريقة العمل، أو شارك جزءاً من الهامش.", steps: ["قِس الوقت والتكلفة لكل وحدة لدى المستفيدين.", "قارن الأجر بهذا الوقت والتكلفة.", "جرِّب أجراً أو طريقة معدّلة مع عدد قليل من المستفيدين."], evidence: ["سجلات المدفوعات", "سجلات الوقت قبل التعديل وبعده"] },
  },
  {
    key: "C2-SOC-MECH", criterion: "C2", dimension: "social", type: "performance", relatedQuestions: ["C2-Q3", "C2-Q4"],
    when: (d) => d.reading === "Absent",
    en: { title: "Define how beneficiaries earn", weakness: "There is no clear mechanism for beneficiaries to earn income.", why: "Under your beneficiary model, income is part of the benefit beneficiaries should receive.", action: "Define the pay model: rate, unit, and payment schedule.", steps: ["Decide what beneficiaries are paid for.", "Set a rate and payment schedule.", "Pilot it and record the first payments."], evidence: ["Written pay model", "First payment records"] },
    ar: { title: "حدِّد كيف يحصل المستفيدون على دخل", weakness: "لا توجد آلية واضحة لحصول المستفيدين على دخل.", why: "في نموذج المستفيدين الخاص بك، الدخل جزء من الفائدة التي يجب أن يحصلوا عليها.", action: "حدِّد نموذج الأجر: القيمة والوحدة وموعد الدفع.", steps: ["حدِّد مقابل ماذا يُدفع للمستفيدين.", "ضع قيمة وجدولاً للدفع.", "جرِّبه وسجِّل أول المدفوعات."], evidence: ["نموذج أجر مكتوب", "سجلات أول المدفوعات"] },
  },
  {
    key: "C2-SOC-DELAY", criterion: "C2", dimension: "social", type: "performance", relatedQuestions: ["C2-Q4"], relatedFlags: ["delayed_beneficiary_income"],
    when: (d) => has(d, "delayed_beneficiary_income"),
    en: { title: "Shorten the wait for beneficiary income", weakness: "Beneficiaries need significant time or investment before earning adequately.", why: "Beneficiaries carry the ramp-up cost, which can push them to drop out.", action: "Shorten or support the training period and stage income early.", steps: ["Map the steps before a beneficiary earns.", "Introduce paid tasks early in training.", "Track time to first income."], evidence: ["Training plan", "Income timeline", "Pilot pay data"] },
    ar: { title: "قصِّر فترة انتظار دخل المستفيد", weakness: "يحتاج المستفيدون إلى وقت أو استثمار كبير قبل تحقيق دخل مناسب.", why: "المستفيدون يتحملون تكلفة فترة البداية، وقد يدفعهم ذلك للانسحاب.", action: "قصِّر فترة التدريب أو ادعمها، وابدأ الدخل على مراحل مبكرة.", steps: ["ارسم الخطوات قبل أن يحقق المستفيد دخلاً.", "أدخِل مهام مدفوعة في وقت مبكر من التدريب.", "تابع الوقت حتى أول دخل."], evidence: ["خطة التدريب", "جدول زمني للدخل", "بيانات أجور التجربة"] },
  },
  {
    key: "C2-SOC-EVID", criterion: "C2", dimension: "social", type: "evidence", relatedQuestions: ["C2-Q3", "C2-Q4"],
    when: (d) => lowConf(d),
    en: { title: "Document beneficiary income", weakness: "Statements about beneficiary income are not supported by records.", why: "Fair income must be demonstrated, not assumed.", action: "Keep payment records and time logs, and collect beneficiaries' own views.", steps: ["Record each payment to beneficiaries.", "Log hours or units worked.", "Interview a few beneficiaries about income adequacy."], evidence: ["Payment records", "Time logs", "Documented beneficiary interviews"] },
    ar: { title: "وثِّق دخل المستفيدين", weakness: "ما يُذكر عن دخل المستفيدين غير مدعوم بسجلات.", why: "الدخل العادل يجب إثباته لا افتراضه.", action: "احتفظ بسجلات المدفوعات والوقت، واجمع آراء المستفيدين أنفسهم.", steps: ["سجِّل كل دفعة للمستفيدين.", "سجِّل الساعات أو الوحدات المنجزة.", "قابل عدداً من المستفيدين عن كفاية الدخل."], evidence: ["سجلات المدفوعات", "سجلات الوقت", "مقابلات موثقة مع المستفيدين"] },
  },
  // ===== C3 Recurring Revenue =====
  {
    key: "C3-COM-UNTAPPED", criterion: "C3", dimension: "commercial", type: "performance", relatedQuestions: ["C3-Q1", "C3-Q2"], relatedFlags: ["untapped_recurring_need"],
    when: (d) => has(d, "untapped_recurring_need"),
    en: { title: "Turn the recurring need into repeat revenue", weakness: "Customers' need recurs, but the business model captures only one purchase.", why: "Repeat revenue makes income predictable and lowers the cost of each sale.", action: "Design a repeat offer: refills, subscription, maintenance, or service contract.", steps: ["Identify what customers need again and how often.", "Design a simple repeat offer.", "Test it with existing customers."], evidence: ["Repeat purchase records", "Subscription or service contracts"] },
    ar: { title: "حوِّل الاحتياج المتكرر إلى إيراد متكرر", weakness: "احتياج العملاء يتكرر، لكن نموذج العمل يستفيد من عملية شراء واحدة فقط.", why: "الإيراد المتكرر يجعل الدخل قابلاً للتوقع ويخفض تكلفة كل عملية بيع.", action: "صمِّم عرضاً متكرراً: إعادة تعبئة، أو اشتراك، أو صيانة، أو عقد خدمة.", steps: ["حدِّد ما يحتاجه العملاء مرة أخرى وكل كم من الوقت.", "صمِّم عرضاً متكرراً بسيطاً.", "جرِّبه مع العملاء الحاليين."], evidence: ["سجلات الشراء المتكرر", "عقود اشتراك أو خدمة"] },
  },
  {
    key: "C3-COM-ONEOFF", criterion: "C3", dimension: "commercial", type: "performance", relatedQuestions: ["C3-Q1", "C3-Q2"],
    when: (_d, a) => ans(a, "C3-Q1", 4) && ans(a, "C3-Q2", 4),
    en: { title: "Add products for the same customers", weakness: "The product is bought once and the need does not recur.", why: "One-time sales require constantly finding new customers.", action: "Add complementary products or services for the same customers, or plan customer acquisition costs explicitly.", steps: ["Ask customers what else they need around this product.", "Pilot one complementary offer.", "Track the cost of acquiring each new customer."], evidence: ["Add-on sales", "Acquisition cost records"] },
    ar: { title: "أضف منتجات للعملاء أنفسهم", weakness: "المنتج يُشترى مرة واحدة والاحتياج لا يتكرر.", why: "البيع لمرة واحدة يتطلب البحث المستمر عن عملاء جدد.", action: "أضف منتجات أو خدمات مكملة للعملاء أنفسهم، أو خطِّط صراحة لتكلفة جذب العملاء.", steps: ["اسأل العملاء عما يحتاجونه أيضاً حول هذا المنتج.", "جرِّب عرضاً مكملاً واحداً.", "تابع تكلفة جذب كل عميل جديد."], evidence: ["مبيعات المنتجات المكملة", "سجلات تكلفة جذب العملاء"] },
  },
  {
    key: "C3-COM-SEASONAL", criterion: "C3", dimension: "commercial", type: "performance", relatedQuestions: ["C3-Q1", "C3-Q2"],
    when: (_d, a) => ans(a, "C3-Q1", 2) || ans(a, "C3-Q2", 2, 3),
    en: { title: "Fill the gaps between seasons", weakness: "Revenue depends on seasons or occasions.", why: "Gaps in revenue create cash-flow and work gaps.", action: "Add off-season products or customer segments.", steps: ["Map sales by month.", "Identify a product or segment for the low months.", "Test it in the next low season."], evidence: ["Sales by month"] },
    ar: { title: "املأ الفجوات بين المواسم", weakness: "الإيرادات تعتمد على المواسم أو المناسبات.", why: "فجوات الإيرادات تخلق فجوات في السيولة وفي العمل.", action: "أضف منتجات أو فئات عملاء لفترات خارج الموسم.", steps: ["ارسم المبيعات شهراً بشهر.", "حدِّد منتجاً أو فئة للأشهر الضعيفة.", "جرِّبه في الموسم الضعيف القادم."], evidence: ["المبيعات حسب الشهر"] },
  },
  {
    key: "C3-COM-EVID", criterion: "C3", dimension: "commercial", type: "evidence", relatedQuestions: ["C3-Q1", "C3-Q2"],
    when: (d) => lowConf(d),
    en: { title: "Show that customers come back", weakness: "Repeat purchasing is expected but not documented.", why: "Recurring revenue must be shown by customers who actually return; recurring donations do not count.", action: "Track repeat customers and attach contracts where they exist.", steps: ["Keep a simple customer log with purchase dates.", "Interview customers about how often they need the product.", "Attach signed service contracts."], evidence: ["Repeat-customer records", "Signed contracts", "Customer interview notes"] },
    ar: { title: "أثبت أن العملاء يعودون", weakness: "الشراء المتكرر متوقع لكنه غير موثق.", why: "الإيراد المتكرر يثبته عملاء يعودون فعلاً؛ والتبرعات المتكررة لا تُحسب.", action: "تابع العملاء المتكررين وأرفق العقود إن وُجدت.", steps: ["احتفظ بسجل بسيط للعملاء وتواريخ الشراء.", "قابل العملاء عن عدد مرات احتياجهم للمنتج.", "أرفق عقود الخدمة الموقعة."], evidence: ["سجلات العملاء المتكررين", "عقود موقعة", "ملاحظات مقابلات العملاء"] },
  },
  {
    key: "C3-SOC-CONT", criterion: "C3", dimension: "social", type: "performance", relatedQuestions: ["C3-Q3", "C3-Q4"],
    when: (d) => d.status === "scored" && sc(d) >= 2 && sc(d) <= 3,
    en: { title: "Make beneficiaries' work continuous", weakness: "Beneficiaries' work and income are seasonal, order-dependent, or one-time.", why: "Continuity turns participation into a livelihood.", action: "Smooth production across the year, build buffer stock, and diversify orders.", steps: ["Plan production against expected orders by month.", "Produce stock in quiet months where possible.", "Seek orders from more than one customer type."], evidence: ["Work schedules", "Monthly payment records"] },
    ar: { title: "اجعل عمل المستفيدين مستمراً", weakness: "عمل المستفيدين ودخلهم موسمي أو مرتبط بالطلبات أو لمرة واحدة.", why: "الاستمرارية تحوّل المشاركة إلى مصدر رزق.", action: "وزِّع الإنتاج على مدار العام، وكوِّن مخزوناً احتياطياً، ونوِّع مصادر الطلبات.", steps: ["خطِّط الإنتاج وفق الطلبات المتوقعة لكل شهر.", "أنتج مخزوناً في الأشهر الهادئة إن أمكن.", "ابحث عن طلبات من أكثر من نوع من العملاء."], evidence: ["جداول العمل", "سجلات المدفوعات الشهرية"] },
  },
  {
    key: "C3-SOC-LINK", criterion: "C3", dimension: "social", type: "performance", relatedQuestions: ["C3-Q3", "C3-Q4"],
    when: (d) => d.reading === "Absent",
    en: { title: "Link recurring orders to beneficiaries' work", weakness: "There is no clear link between recurring revenue and beneficiaries' work or income.", why: "If revenue recurs but beneficiaries do not benefit continuously, the social benefit is not sustained.", action: "Define how recurring orders are allocated to beneficiaries.", steps: ["Write an allocation rule for orders.", "Share it with beneficiaries.", "Record allocations each month."], evidence: ["Allocation policy", "Allocation records"] },
    ar: { title: "اربط الطلبات المتكررة بعمل المستفيدين", weakness: "لا توجد علاقة واضحة بين الإيرادات المتكررة وعمل المستفيدين أو دخلهم.", why: "إذا تكررت الإيرادات دون أن يستفيد المستفيدون باستمرار، لا تستمر الفائدة الاجتماعية.", action: "حدِّد كيف تُوزَّع الطلبات المتكررة على المستفيدين.", steps: ["اكتب قاعدة لتوزيع الطلبات.", "شاركها مع المستفيدين.", "سجِّل التوزيع كل شهر."], evidence: ["سياسة التوزيع", "سجلات التوزيع"] },
  },
  {
    key: "C3-SOC-EVID", criterion: "C3", dimension: "social", type: "evidence", relatedQuestions: ["C3-Q3", "C3-Q4"],
    when: (d) => lowConf(d),
    en: { title: "Document continuity of work and income", weakness: "Continuity of beneficiaries' work and income is not documented.", why: "Continuity must be shown over several periods.", action: "Keep work schedules and payment history across months.", steps: ["Record who worked and when.", "Record payments each month.", "Attach a few months of records."], evidence: ["Work schedules", "Payment history across months"] },
    ar: { title: "وثِّق استمرارية العمل والدخل", weakness: "استمرارية عمل المستفيدين ودخلهم غير موثقة.", why: "الاستمرارية تُثبت عبر عدة فترات.", action: "احتفظ بجداول العمل وسجل المدفوعات عبر الأشهر.", steps: ["سجِّل من عمل ومتى.", "سجِّل المدفوعات كل شهر.", "أرفق سجلات عدة أشهر."], evidence: ["جداول العمل", "سجل المدفوعات عبر الأشهر"] },
  },
  // ===== C4 Leverage Our Capabilities =====
  {
    key: "C4-COM-GAPS", criterion: "C4", dimension: "commercial", type: "performance", relatedQuestions: ["C4-Q2"],
    when: (d) => d.status === "scored" && sc(d) <= 3,
    en: { title: "Close the team's capability gaps", weakness: "The team lacks some capabilities the idea requires.", why: "Gaps raise execution risk, cost, and time to market.", action: "For each missing capability decide whether to build it (training), hire it, or borrow it (advisor or partner), starting with core ones.", steps: ["List the capabilities the idea needs.", "Mark which the team has today.", "Assign a build, hire, or borrow plan to each gap."], evidence: ["Capability gap plan", "Confirmed hires or advisors", "Training certificates"] },
    ar: { title: "سُدَّ فجوات قدرات الفريق", weakness: "الفريق يفتقد بعض القدرات التي تتطلبها الفكرة.", why: "الفجوات ترفع مخاطر التنفيذ والتكلفة والوقت اللازم للوصول إلى السوق.", action: "لكل قدرة ناقصة قرِّر: تطويرها (تدريب)، أو توظيفها، أو الاستعانة بها (مستشار أو شريك)، بدءاً بالقدرات الأساسية.", steps: ["اكتب القدرات التي تحتاجها الفكرة.", "حدِّد ما يملكه الفريق اليوم.", "ضع خطة تطوير أو توظيف أو استعانة لكل فجوة."], evidence: ["خطة فجوات القدرات", "تعيينات أو مستشارون مؤكدون", "شهادات تدريب"] },
  },
  {
    key: "C4-COM-NEWTEAM", criterion: "C4", dimension: "commercial", type: "performance", relatedQuestions: ["C4-Q2"],
    when: (_d, a) => ans(a, "C4-Q2", 4),
    en: { title: "Build on what the team already does well", weakness: "Execution depends on a new team or new partners.", why: "Not building on existing capability increases risk and cost.", action: "Re-scope the idea toward the team's existing strengths, or secure committed partners.", steps: ["Identify the parts of the idea the team can deliver today.", "Consider starting with those parts.", "Secure written commitments from any essential partner."], evidence: ["Re-scoped plan", "Partner agreements"] },
    ar: { title: "ابنِ على ما يجيده الفريق بالفعل", weakness: "التنفيذ يعتمد على فريق جديد أو شركاء جدد.", why: "عدم البناء على القدرات الموجودة يزيد المخاطر والتكلفة.", action: "أعد تحديد نطاق الفكرة نحو نقاط قوة الفريق الحالية، أو احصل على التزام من شركاء.", steps: ["حدِّد أجزاء الفكرة التي يستطيع الفريق تنفيذها اليوم.", "فكِّر في البدء بهذه الأجزاء.", "احصل على التزام مكتوب من أي شريك أساسي."], evidence: ["خطة بنطاق معدّل", "اتفاقيات مع الشركاء"] },
  },
  {
    key: "C4-COM-TECH", criterion: "C4", dimension: "commercial", type: "performance", relatedQuestions: ["C4-Q1"], relatedFlags: ["non_technical_team_only"],
    when: (d) => has(d, "non_technical_team_only"),
    en: { title: "Add product or technical expertise", weakness: "The team's main capability is not technical expertise related to the product.", why: "Product expertise is needed to control quality and cost.", action: "Add technical expertise through a co-founder, advisor, or training.", steps: ["Define the technical knowledge the product needs.", "Find a person or course that provides it.", "Agree their role in writing."], evidence: ["Named person and role", "Certificates"] },
    ar: { title: "أضِف خبرة فنية مرتبطة بالمنتج", weakness: "القدرة الأساسية للفريق ليست خبرة فنية مرتبطة بالمنتج.", why: "الخبرة في المنتج ضرورية للتحكم في الجودة والتكلفة.", action: "أضِف خبرة فنية من خلال شريك مؤسس أو مستشار أو تدريب.", steps: ["حدِّد المعرفة الفنية التي يحتاجها المنتج.", "ابحث عن شخص أو دورة توفرها.", "اتفق على دوره كتابةً."], evidence: ["اسم الشخص ودوره", "شهادات"] },
  },
  {
    key: "C4-COM-EVID", criterion: "C4", dimension: "commercial", type: "evidence", relatedQuestions: ["C4-Q1", "C4-Q2"],
    when: (d) => lowConf(d),
    en: { title: "Show the team's capabilities", weakness: "The team's capabilities are described but not documented.", why: "Investors and partners need to see capability, not only claims.", action: "Attach team profiles, past project records, and proof of key relationships.", steps: ["Prepare short profiles for each team member.", "Attach records of relevant past work.", "Attach letters or transactions with key suppliers or customers."], evidence: ["Team profiles", "Past project records", "Relationship evidence"] },
    ar: { title: "أظهِر قدرات الفريق", weakness: "قدرات الفريق موصوفة لكنها غير موثقة.", why: "المستثمرون والشركاء يحتاجون رؤية القدرات لا مجرد الادعاء.", action: "أرفق ملفات تعريف الفريق وسجلات المشاريع السابقة وما يثبت العلاقات الأساسية.", steps: ["أعدّ نبذة مختصرة لكل عضو في الفريق.", "أرفق سجلات أعمال سابقة ذات صلة.", "أرفق خطابات أو تعاملات مع موردين أو عملاء أساسيين."], evidence: ["ملفات تعريف الفريق", "سجلات مشاريع سابقة", "ما يثبت العلاقات"] },
  },
  {
    key: "C4-SOC-MISMATCH", criterion: "C4", dimension: "social", type: "performance", relatedQuestions: ["C4-Q3", "C4-Q4"],
    when: (d) => d.status === "scored" && sc(d) <= 3,
    en: { title: "Match tasks to beneficiaries' existing skills", weakness: "Beneficiaries need substantial training before they can take part.", why: "A long path to participation delays income and increases drop-out.", action: "Adapt tasks to existing skills, or design a staged training plan.", steps: ["Assess the skills of a sample of beneficiaries.", "Assign first tasks that use existing skills.", "Plan training in short stages."], evidence: ["Task design", "Training plan", "Pilot output"] },
    ar: { title: "طابِق المهام مع مهارات المستفيدين الحالية", weakness: "يحتاج المستفيدون إلى تدريب كبير قبل أن يستطيعوا المشاركة.", why: "طول الطريق إلى المشاركة يؤخر الدخل ويزيد الانسحاب.", action: "عدِّل المهام لتناسب المهارات الحالية، أو صمِّم خطة تدريب على مراحل.", steps: ["قيِّم مهارات عينة من المستفيدين.", "حدِّد مهام أولى تستخدم المهارات الحالية.", "خطِّط التدريب على مراحل قصيرة."], evidence: ["تصميم المهام", "خطة التدريب", "مخرجات التجربة"] },
  },
  {
    key: "C4-SOC-SEGMENT", criterion: "C4", dimension: "social", type: "performance", relatedQuestions: ["C4-Q3"], relatedFlags: ["heterogeneous_skills"],
    when: (d) => has(d, "heterogeneous_skills"),
    en: { title: "Assign roles by skill level", weakness: "Skills vary widely among beneficiaries.", why: "One plan for everyone leads to uneven participation.", action: "Segment beneficiaries by skill level and assign roles accordingly.", steps: ["Group beneficiaries by current skill.", "Define a role for each group.", "Review groups every few months."], evidence: ["Skills segmentation", "Role assignments"] },
    ar: { title: "وزِّع الأدوار حسب مستوى المهارة", weakness: "المهارات تختلف كثيراً بين المستفيدين.", why: "خطة واحدة للجميع تؤدي إلى مشاركة غير متوازنة.", action: "قسِّم المستفيدين حسب مستوى المهارة ووزِّع الأدوار بناءً على ذلك.", steps: ["صنِّف المستفيدين حسب المهارة الحالية.", "حدِّد دوراً لكل مجموعة.", "راجع المجموعات كل بضعة أشهر."], evidence: ["تصنيف المهارات", "توزيع الأدوار"] },
  },
  {
    key: "C4-SOC-EVID", criterion: "C4", dimension: "social", type: "evidence", relatedQuestions: ["C4-Q3", "C4-Q4"],
    when: (d) => lowConf(d),
    en: { title: "Assess beneficiaries' skills", weakness: "Beneficiaries' skills are described in general terms only.", why: "Training needs and readiness cannot be planned without an assessment.", action: "Run a documented skills assessment or a short production pilot.", steps: ["Design a simple practical test.", "Run it with a sample of beneficiaries.", "Record results and time needed."], evidence: ["Skills assessment results", "Pilot output and timing"] },
    ar: { title: "قيِّم مهارات المستفيدين", weakness: "مهارات المستفيدين موصوفة بشكل عام فقط.", why: "لا يمكن تخطيط احتياجات التدريب والجاهزية دون تقييم.", action: "نفِّذ تقييماً موثقاً للمهارات أو تجربة إنتاج قصيرة.", steps: ["صمِّم اختباراً عملياً بسيطاً.", "نفِّذه مع عينة من المستفيدين.", "سجِّل النتائج والوقت المطلوب."], evidence: ["نتائج تقييم المهارات", "مخرجات التجربة وتوقيتها"] },
  },
  // ===== C5 Supply Chain Capabilities =====
  {
    key: "C5-COM-SINGLE", criterion: "C5", dimension: "commercial", type: "performance", relatedQuestions: ["C5-Q1"], relatedFlags: ["single_supplier"],
    when: (d) => has(d, "single_supplier"),
    en: { title: "Add an alternative supplier", weakness: "Production depends on one main supplier.", why: "One supplier's delay can stop production.", action: "Identify and qualify at least one alternative supplier for each critical input.", steps: ["List critical inputs.", "Request quotes from alternative suppliers.", "Place a small trial order."], evidence: ["Quotes or invoices from a second supplier"] },
    ar: { title: "أضِف مورداً بديلاً", weakness: "الإنتاج يعتمد على مورد أساسي واحد.", why: "تأخر مورد واحد قد يوقف الإنتاج.", action: "حدِّد وأهِّل مورداً بديلاً واحداً على الأقل لكل خامة أساسية.", steps: ["اكتب الخامات الأساسية.", "اطلب عروض أسعار من موردين بدلاء.", "نفِّذ طلب تجربة صغيراً."], evidence: ["عروض أسعار أو فواتير من مورد ثانٍ"] },
  },
  {
    key: "C5-COM-DIST", criterion: "C5", dimension: "commercial", type: "performance", relatedQuestions: ["C5-Q1"],
    when: (_d, a) => ans(a, "C5-Q1", 3, 4),
    en: { title: "Reduce distance and import risk", weakness: "Inputs come from outside the area or from imports.", why: "Distance and imports add cost, delay, and currency risk.", action: "Search for closer sources, hold safety stock, and agree lead times.", steps: ["Search for local sources of each input.", "Decide a safety stock level.", "Agree delivery times in writing."], evidence: ["Local quotes", "Stock policy", "Supplier agreements"] },
    ar: { title: "قلِّل مخاطر المسافة والاستيراد", weakness: "الخامات تأتي من خارج المنطقة أو من الاستيراد.", why: "المسافة والاستيراد يضيفان تكلفة وتأخيراً ومخاطر سعر الصرف.", action: "ابحث عن مصادر أقرب، واحتفظ بمخزون أمان، واتفق على مواعيد التوريد.", steps: ["ابحث عن مصادر محلية لكل خامة.", "حدِّد مستوى مخزون الأمان.", "اتفق على مواعيد التسليم كتابةً."], evidence: ["عروض أسعار محلية", "سياسة المخزون", "اتفاقيات مع الموردين"] },
  },
  {
    key: "C5-COM-OBST", criterion: "C5", dimension: "commercial", type: "performance", relatedQuestions: ["C5-Q2"],
    when: (_d, a) => ans(a, "C5-Q2", 2, 3),
    en: { title: "Plan around supply obstacles", weakness: "There are challenges or obstacles in materials, equipment, or transport.", why: "Production continuity is at risk.", action: "List each obstacle and a mitigation for it.", steps: ["Name each obstacle (materials, equipment, transport).", "Define a mitigation and an owner.", "Track deliveries for a few months."], evidence: ["Mitigation plan", "Delivery records"] },
    ar: { title: "خطِّط لمواجهة عوائق التوريد", weakness: "توجد تحديات أو عوائق في الخامات أو المعدات أو النقل.", why: "استمرارية الإنتاج معرضة للخطر.", action: "اكتب كل عائق وطريقة التعامل معه.", steps: ["سمِّ كل عائق (خامات، معدات، نقل).", "حدِّد حلاً ومسؤولاً عنه.", "تابع التوريدات لعدة أشهر."], evidence: ["خطة معالجة العوائق", "سجلات التوريد"] },
  },
  {
    key: "C5-COM-PLAN", criterion: "C5", dimension: "commercial", type: "performance", relatedQuestions: ["C5-Q2"],
    when: (d) => d.reading === "Absent",
    en: { title: "Create a supply and production plan", weakness: "There is no clear production and supply plan yet.", why: "Production cannot be scheduled reliably without one.", action: "Build a plan covering inputs, quantities, sources, transport, and capacity.", steps: ["List inputs and quantities per unit.", "Name a source and transport for each.", "Estimate monthly capacity."], evidence: ["Supply and production plan document"] },
    ar: { title: "ضع خطة للتوريد والإنتاج", weakness: "لا توجد خطة واضحة للإنتاج والتوريد حتى الآن.", why: "لا يمكن جدولة الإنتاج بشكل موثوق دونها.", action: "ضع خطة تشمل الخامات والكميات والمصادر والنقل والطاقة الإنتاجية.", steps: ["اكتب الخامات والكميات لكل وحدة.", "حدِّد مصدراً ووسيلة نقل لكل خامة.", "قدِّر الطاقة الإنتاجية الشهرية."], evidence: ["وثيقة خطة التوريد والإنتاج"] },
  },
  {
    key: "C5-COM-EVID", criterion: "C5", dimension: "commercial", type: "evidence", relatedQuestions: ["C5-Q1", "C5-Q2"],
    when: (d) => lowConf(d),
    en: { title: "Document your supply arrangements", weakness: "Supply availability is stated but not documented.", why: "Reliability is shown by named suppliers and regular deliveries.", action: "Attach a supplier list with quotes and purchase records.", steps: ["List suppliers with contacts and locations.", "Attach recent quotes.", "Attach purchase or delivery records."], evidence: ["Supplier list and quotes", "Purchase invoices", "Supplier agreements"] },
    ar: { title: "وثِّق ترتيبات التوريد", weakness: "توفر الخامات مذكور لكنه غير موثق.", why: "الموثوقية تثبتها أسماء موردين محددين وتوريدات منتظمة.", action: "أرفق قائمة الموردين مع عروض الأسعار وسجلات الشراء.", steps: ["اكتب الموردين وبيانات التواصل والمواقع.", "أرفق عروض أسعار حديثة.", "أرفق سجلات الشراء أو التسليم."], evidence: ["قائمة الموردين وعروض الأسعار", "فواتير الشراء", "اتفاقيات مع الموردين"] },
  },
  {
    key: "C5-SOC-ACCESS", criterion: "C5", dimension: "social", type: "performance", relatedQuestions: ["C5-Q3"],
    when: (_d, a) => ans(a, "C5-Q3", 2, 3, 4),
    en: { title: "Make resources easier for beneficiaries to reach", weakness: "Beneficiaries face distance, cost, or dependence when obtaining materials and tools.", why: "Access barriers limit who can participate.", action: "Arrange collection points, group purchasing, or delivery that beneficiaries can later take over.", steps: ["Map where beneficiaries live and where resources are.", "Choose an access arrangement.", "Record participation before and after."], evidence: ["Access arrangement description", "Participation records"] },
    ar: { title: "سهِّل وصول المستفيدين إلى الموارد", weakness: "يواجه المستفيدون مسافة أو تكلفة أو اعتماداً على غيرهم للحصول على الخامات والأدوات.", why: "عوائق الوصول تحدّ من عدد من يستطيع المشاركة.", action: "رتِّب نقاط تجميع أو شراء جماعي أو توصيل يمكن للمستفيدين تولّيه لاحقاً.", steps: ["حدِّد أماكن المستفيدين وأماكن الموارد.", "اختر طريقة لتسهيل الوصول.", "سجِّل المشاركة قبل التغيير وبعده."], evidence: ["وصف ترتيب الوصول", "سجلات المشاركة"] },
  },
  {
    key: "C5-SOC-DEP", criterion: "C5", dimension: "social", type: "performance", relatedQuestions: ["C5-Q4"],
    when: (_d, a) => ans(a, "C5-Q4", 2, 3, 4),
    en: { title: "Reduce beneficiaries' dependence on the team for resources", weakness: "Beneficiaries depend on the project team to obtain resources.", why: "Permanent dependence limits scale and sustainability.", action: "Train beneficiaries to order and deal with suppliers, and introduce them to suppliers.", steps: ["Show beneficiaries how orders are placed.", "Introduce them to suppliers.", "Let them place orders with light support."], evidence: ["Beneficiary purchase records"] },
    ar: { title: "قلِّل اعتماد المستفيدين على الفريق في الموارد", weakness: "يعتمد المستفيدون على فريق المشروع للحصول على الموارد.", why: "الاعتماد الدائم يحدّ من التوسع والاستدامة.", action: "درِّب المستفيدين على الطلب والتعامل مع الموردين، وعرِّفهم بالموردين.", steps: ["اشرح للمستفيدين كيف تتم الطلبات.", "عرِّفهم بالموردين.", "اتركهم يطلبون بدعم بسيط."], evidence: ["سجلات شراء المستفيدين"] },
  },
  {
    key: "C5-SOC-EVID", criterion: "C5", dimension: "social", type: "evidence", relatedQuestions: ["C5-Q3", "C5-Q4"],
    when: (d) => lowConf(d),
    en: { title: "Document beneficiaries' access to resources", weakness: "Beneficiaries' access to resources is described but not documented.", why: "Access needs to be shown per location.", action: "Map access per location and keep records of beneficiaries' own purchases.", steps: ["Record distance and cost per location.", "Record purchases made by beneficiaries.", "Attach the mapping."], evidence: ["Access mapping", "Beneficiary purchase records"] },
    ar: { title: "وثِّق وصول المستفيدين إلى الموارد", weakness: "وصول المستفيدين إلى الموارد موصوف لكنه غير موثق.", why: "يجب إظهار الوصول لكل موقع.", action: "ارسم خريطة الوصول لكل موقع واحتفظ بسجلات مشتريات المستفيدين.", steps: ["سجِّل المسافة والتكلفة لكل موقع.", "سجِّل المشتريات التي يقوم بها المستفيدون.", "أرفق الخريطة."], evidence: ["خريطة الوصول", "سجلات مشتريات المستفيدين"] },
  },
  // ===== C6 Direct Customer Access =====
  {
    key: "C6-COM-NOCHANNEL", criterion: "C6", dimension: "commercial", type: "performance", relatedQuestions: ["C6-Q1", "C6-Q2"],
    when: (d) => d.reading === "Absent",
    en: { title: "Open a first sales channel", weakness: "There is no defined sales channel or route to customers yet.", why: "Without a channel there is no revenue path.", action: "Choose one channel that fits the paying group and run a small sales test.", steps: ["Pick the channel your paying group already uses.", "Run a small sales test.", "Record what sold and through which channel."], evidence: ["First sales via the channel"] },
    ar: { title: "افتح أول قناة بيع", weakness: "لا توجد قناة بيع محددة أو وسيلة للوصول إلى العملاء حتى الآن.", why: "دون قناة لا يوجد مسار للإيرادات.", action: "اختر قناة واحدة تناسب الفئة التي تدفع ونفِّذ اختبار بيع صغيراً.", steps: ["اختر القناة التي تستخدمها الفئة التي تدفع بالفعل.", "نفِّذ اختبار بيع صغيراً.", "سجِّل ما بيع ومن أي قناة."], evidence: ["أول مبيعات عبر القناة"] },
  },
  {
    key: "C6-COM-SINGLE", criterion: "C6", dimension: "commercial", type: "performance", relatedQuestions: ["C6-Q2"], relatedFlags: ["single_intermediary"],
    when: (d) => has(d, "single_intermediary"),
    en: { title: "Reduce dependence on one intermediary", weakness: "Access to customers depends on a single intermediary.", why: "One partner controls access; losing them stops sales.", action: "Formalise the relationship in writing and develop a second channel.", steps: ["Agree terms with the intermediary in writing.", "Identify a second channel.", "Test it with a small volume."], evidence: ["Signed agreement", "Sales through the second channel"] },
    ar: { title: "قلِّل الاعتماد على وسيط واحد", weakness: "الوصول إلى العملاء يعتمد على وسيط واحد.", why: "شريك واحد يتحكم في الوصول؛ وفقدانه يوقف المبيعات.", action: "وثِّق العلاقة كتابةً وطوِّر قناة ثانية.", steps: ["اتفق على الشروط مع الوسيط كتابةً.", "حدِّد قناة ثانية.", "جرِّبها بكمية صغيرة."], evidence: ["اتفاق موقّع", "مبيعات عبر القناة الثانية"] },
  },
  {
    key: "C6-COM-MULTI", criterion: "C6", dimension: "commercial", type: "performance", relatedQuestions: ["C6-Q2"],
    when: (_d, a) => ans(a, "C6-Q2", 3),
    en: { title: "Test a direct channel", weakness: "Sales rely on several intermediaries or distributors.", why: "Intermediaries reduce your share of the price and your contact with customers.", action: "Test a direct channel for part of sales.", steps: ["Choose a direct channel (page, shop, direct sales).", "Sell a share of output through it.", "Compare margin and feedback."], evidence: ["Direct sales records"] },
    ar: { title: "جرِّب قناة بيع مباشرة", weakness: "المبيعات تعتمد على عدة وسطاء أو موزعين.", why: "الوسطاء يقللون حصتك من السعر وتواصلك مع العملاء.", action: "جرِّب قناة مباشرة لجزء من المبيعات.", steps: ["اختر قناة مباشرة (صفحة، محل، بيع مباشر).", "بِع جزءاً من الإنتاج من خلالها.", "قارن الهامش وآراء العملاء."], evidence: ["سجلات المبيعات المباشرة"] },
  },
  {
    key: "C6-COM-EVID", criterion: "C6", dimension: "commercial", type: "evidence", relatedQuestions: ["C6-Q1", "C6-Q2"],
    when: (d) => lowConf(d),
    en: { title: "Show which channels actually sell", weakness: "Channels are listed but not shown to produce paying customers.", why: "A channel that can be used is not yet proven access; followers are not sales.", action: "Track sales by channel and attach agreements with intermediaries.", steps: ["Tag each sale with its channel.", "Summarise monthly sales by channel.", "Attach intermediary agreements."], evidence: ["Sales-by-channel report", "Intermediary agreements"] },
    ar: { title: "أثبت أي القنوات تبيع فعلاً", weakness: "القنوات مذكورة لكن لم يثبت أنها تجلب عملاء يدفعون.", why: "القناة الممكنة ليست وصولاً مثبتاً بعد؛ والمتابعون ليسوا مبيعات.", action: "تابع المبيعات حسب القناة وأرفق الاتفاقات مع الوسطاء.", steps: ["سجِّل القناة لكل عملية بيع.", "لخِّص المبيعات الشهرية حسب القناة.", "أرفق اتفاقات الوسطاء."], evidence: ["تقرير المبيعات حسب القناة", "اتفاقات الوسطاء"] },
  },
  {
    key: "C6-SOC-VALUE", criterion: "C6", dimension: "social", type: "performance", relatedQuestions: ["C6-Q3"],
    when: (_d, a) => ans(a, "C6-Q3", 2, 3, 4),
    en: { title: "Involve beneficiaries in higher-value stages", weakness: "Beneficiaries take part only in basic production, or not at all, in value-adding stages.", why: "Higher-value stages raise beneficiaries' share of value and skills.", action: "Involve beneficiaries step by step in finishing, packaging, quality, or marketing.", steps: ["Pick one value-adding stage.", "Train a few beneficiaries for it.", "Record their output and role."], evidence: ["Role map", "Output records"] },
    ar: { title: "أشرِك المستفيدين في المراحل الأعلى قيمة", weakness: "يشارك المستفيدون في الإنتاج الأساسي فقط، أو لا يشاركون، في مراحل إضافة القيمة.", why: "المراحل الأعلى قيمة ترفع حصة المستفيدين من القيمة ومهاراتهم.", action: "أشرِك المستفيدين تدريجياً في التشطيب أو التغليف أو الجودة أو التسويق.", steps: ["اختر مرحلة واحدة تضيف قيمة.", "درِّب عدداً من المستفيدين عليها.", "سجِّل إنتاجهم ودورهم."], evidence: ["خريطة الأدوار", "سجلات الإنتاج"] },
  },
  {
    key: "C6-SOC-MARKET", criterion: "C6", dimension: "social", type: "performance", relatedQuestions: ["C6-Q4"],
    when: (_d, a) => ans(a, "C6-Q4", 2, 3, 4),
    en: { title: "Build beneficiaries' role in reaching customers", weakness: "Beneficiaries cannot yet deal with customers without ongoing support.", why: "Market skills reduce dependence and raise beneficiaries' share of value.", action: "Train selected beneficiaries in customer interaction and run joint sales events.", steps: ["Select beneficiaries interested in selling.", "Train them in pricing and customer contact.", "Run a joint sales event."], evidence: ["Beneficiary sales records"] },
    ar: { title: "طوِّر دور المستفيدين في الوصول إلى العملاء", weakness: "لا يستطيع المستفيدون حتى الآن التعامل مع العملاء دون دعم مستمر.", why: "مهارات السوق تقلل الاعتماد وترفع حصة المستفيدين من القيمة.", action: "درِّب مستفيدين مختارين على التعامل مع العملاء ونظِّم فعاليات بيع مشتركة.", steps: ["اختر مستفيدين مهتمين بالبيع.", "درِّبهم على التسعير والتواصل مع العملاء.", "نظِّم فعالية بيع مشتركة."], evidence: ["سجلات مبيعات المستفيدين"] },
  },
  {
    key: "C6-SOC-EVID", criterion: "C6", dimension: "social", type: "evidence", relatedQuestions: ["C6-Q3", "C6-Q4"],
    when: (d) => lowConf(d),
    en: { title: "Document beneficiaries' roles in the value chain", weakness: "Beneficiaries' roles are described but not documented.", why: "Participation in value creation must be shown.", action: "Map who does which stage and keep records of beneficiary-made sales.", steps: ["Write a role map by stage.", "Record sales made by beneficiaries.", "Attach both."], evidence: ["Role map", "Beneficiary sales records"] },
    ar: { title: "وثِّق أدوار المستفيدين في سلسلة القيمة", weakness: "أدوار المستفيدين موصوفة لكنها غير موثقة.", why: "يجب إثبات المشاركة في صنع القيمة.", action: "ارسم من يقوم بكل مرحلة واحتفظ بسجلات المبيعات التي يقوم بها المستفيدون.", steps: ["اكتب خريطة الأدوار حسب المرحلة.", "سجِّل المبيعات التي يقوم بها المستفيدون.", "أرفق الاثنين."], evidence: ["خريطة الأدوار", "سجلات مبيعات المستفيدين"] },
  },
  // ===== C7 PR & Communications =====
  {
    key: "C7-COM-STORY", criterion: "C7", dimension: "commercial", type: "performance", relatedQuestions: ["C7-Q1"],
    when: (_d, a) => ans(a, "C7-Q1", 2, 3),
    en: { title: "Write a clear, distinctive story", weakness: "The project has no clear story or point of difference, or the idea is hard to communicate.", why: "A clear story lowers the cost of attracting customers and partners.", action: "Write a short story linking the problem, the beneficiaries, and the product, and state what is different.", steps: ["Write the story in a few sentences.", "State what makes the product different.", "Ask a few people to retell it and check understanding."], evidence: ["Story text", "Audience feedback"] },
    ar: { title: "اكتب قصة واضحة ومميزة", weakness: "لا توجد للمشروع قصة واضحة أو نقطة تميز، أو الفكرة يصعب توصيلها.", why: "القصة الواضحة تقلل تكلفة جذب العملاء والشركاء.", action: "اكتب قصة قصيرة تربط المشكلة والمستفيدين والمنتج، ووضِّح ما الذي يميزه.", steps: ["اكتب القصة في جمل قليلة.", "وضِّح ما يميز المنتج.", "اطلب من عدة أشخاص إعادة روايتها وتأكد من الفهم."], evidence: ["نص القصة", "آراء الجمهور"] },
  },
  {
    key: "C7-COM-TEST", criterion: "C7", dimension: "commercial", type: "evidence", relatedQuestions: ["C7-Q2"], relatedFlags: ["appeal_untested"],
    when: (d) => has(d, "appeal_untested"),
    en: { title: "Test the story with your audience", weakness: "The story's appeal has not been tested.", why: "Appeal is unknown until real customers and partners react to it.", action: "Test the story with a small group of customers and partners.", steps: ["Share the story with a small group.", "Ask what they remember and whether they would buy or support.", "Record the answers."], evidence: ["Test feedback records"] },
    ar: { title: "اختبر القصة مع جمهورك", weakness: "لم يتم اختبار مدى جاذبية القصة.", why: "الجاذبية مجهولة حتى يتفاعل معها عملاء وشركاء حقيقيون.", action: "اختبر القصة مع مجموعة صغيرة من العملاء والشركاء.", steps: ["شارك القصة مع مجموعة صغيرة.", "اسألهم عما تذكروه وهل سيشترون أو يدعمون.", "سجِّل الإجابات."], evidence: ["سجلات نتائج الاختبار"] },
  },
  {
    key: "C7-COM-CUST", criterion: "C7", dimension: "commercial", type: "performance", relatedQuestions: ["C7-Q2"], relatedFlags: ["supporter_appeal_only"],
    when: (d) => has(d, "supporter_appeal_only"),
    en: { title: "Make the story work for customers", weakness: "The story mainly attracts partners or supporters.", why: "Supporters are not buyers; publicity does not equal customer acquisition.", action: "Adapt the message for paying customers and test it.", steps: ["Rewrite the story from the customer's point of view.", "Test it with customers.", "Track enquiries that follow."], evidence: ["Customer feedback", "Enquiries"] },
    ar: { title: "اجعل القصة مناسبة للعملاء", weakness: "القصة تجذب الشركاء أو الداعمين بشكل أساسي.", why: "الداعمون ليسوا مشترين؛ والانتشار الإعلامي لا يساوي جذب العملاء.", action: "عدِّل الرسالة لتناسب العملاء الذين يدفعون واختبرها.", steps: ["أعد كتابة القصة من وجهة نظر العميل.", "اختبرها مع العملاء.", "تابع الاستفسارات التي تليها."], evidence: ["آراء العملاء", "الاستفسارات"] },
  },
  {
    key: "C7-COM-EVID", criterion: "C7", dimension: "commercial", type: "evidence", relatedQuestions: ["C7-Q1", "C7-Q2"],
    when: (d) => lowConf(d),
    en: { title: "Show how audiences respond", weakness: "Communication potential is stated but not shown.", why: "Audience response is the evidence of appeal.", action: "Attach audience test results or partner and media responses.", steps: ["Collect responses from a test.", "List named partners or outlets that responded.", "Attach them."], evidence: ["Audience test results", "Partner or media responses"] },
    ar: { title: "أظهِر كيف يتفاعل الجمهور", weakness: "القدرة التواصلية مذكورة لكنها غير مثبتة.", why: "تفاعل الجمهور هو الدليل على الجاذبية.", action: "أرفق نتائج اختبار الجمهور أو ردود الشركاء ووسائل الإعلام.", steps: ["اجمع الردود من اختبار.", "اكتب أسماء الشركاء أو الوسائل التي تفاعلت.", "أرفقها."], evidence: ["نتائج اختبار الجمهور", "ردود الشركاء أو الإعلام"] },
  },
  {
    key: "C7-SOC-VOICE", criterion: "C7", dimension: "social", type: "performance", relatedQuestions: ["C7-Q3"], relatedFlags: ["consent_verification", "guardian_consent"],
    when: (_d, a) => ans(a, "C7-Q3", 2, 3),
    en: { title: "Bring beneficiaries' own voices forward, with consent", weakness: "Beneficiaries do not take part directly in telling their stories, or there is no plan for it.", why: "Authenticity and dignity require beneficiaries' participation and informed consent (guardian consent for minors).", action: "Involve beneficiaries in telling their stories, with documented consent.", steps: ["Explain to beneficiaries how stories will be used.", "Obtain written consent (from guardians for minors).", "Let beneficiaries review content before publishing."], evidence: ["Consent forms", "Beneficiary-led content"] },
    ar: { title: "أبرِز أصوات المستفيدين أنفسهم بموافقتهم", weakness: "لا يشارك المستفيدون مباشرة في سرد قصصهم، أو لا توجد خطة لذلك.", why: "المصداقية والكرامة تتطلبان مشاركة المستفيدين وموافقتهم الواعية (وموافقة أولياء الأمور للقُصَّر).", action: "أشرِك المستفيدين في سرد قصصهم مع توثيق موافقتهم.", steps: ["اشرح للمستفيدين كيف ستُستخدم القصص.", "احصل على موافقة مكتوبة (من أولياء الأمور للقُصَّر).", "اسمح للمستفيدين بمراجعة المحتوى قبل نشره."], evidence: ["نماذج الموافقة", "محتوى يقوده المستفيدون"] },
  },
  {
    key: "C7-SOC-INDIC", criterion: "C7", dimension: "social", type: "performance", relatedQuestions: ["C7-Q4"],
    when: (_d, a) => ans(a, "C7-Q4", 3, 4),
    en: { title: "Define how impact will be measured", weakness: "The social impact cannot currently be defined or measured.", why: "Measurable impact is a mandatory objective of a social enterprise.", action: "Define a few outcome indicators and collect a baseline.", steps: ["Choose a small number of changes you expect in beneficiaries' lives.", "Define how each will be measured.", "Collect a baseline now."], evidence: ["Indicator definitions", "Baseline data"] },
    ar: { title: "حدِّد كيف سيُقاس الأثر", weakness: "يصعب حالياً تحديد الأثر المجتمعي أو قياسه.", why: "الأثر القابل للقياس هدف إلزامي للمشروع الاجتماعي.", action: "حدِّد عدداً قليلاً من مؤشرات النتائج واجمع خط الأساس.", steps: ["اختر عدداً قليلاً من التغيرات المتوقعة في حياة المستفيدين.", "حدِّد كيف يُقاس كل منها.", "اجمع خط الأساس الآن."], evidence: ["تعريفات المؤشرات", "بيانات خط الأساس"] },
  },
  {
    key: "C7-SOC-MEASURE", criterion: "C7", dimension: "social", type: "evidence", relatedQuestions: ["C7-Q4"], relatedFlags: ["impact_expected_not_visible"],
    when: (_d, a) => ans(a, "C7-Q4", 1, 2),
    en: { title: "Measure impact regularly", weakness: "Impact is visible or expected but not yet documented and measured.", why: "Impact claims need regular measurement to be credible.", action: "Set up simple periodic measurement and plan when change will be measured.", steps: ["Pick a measurement schedule.", "Collect the same indicators each period.", "Report the results."], evidence: ["Measurement plan", "Measurement records"] },
    ar: { title: "قِس الأثر بانتظام", weakness: "الأثر ظاهر أو متوقع لكنه غير موثق ولا مقاس بعد.", why: "ادعاءات الأثر تحتاج قياساً منتظماً لتكون موثوقة.", action: "ضع نظام قياس دوري بسيطاً وحدِّد متى سيُقاس التغيير.", steps: ["اختر جدولاً للقياس.", "اجمع المؤشرات نفسها في كل فترة.", "اعرض النتائج."], evidence: ["خطة القياس", "سجلات القياس"] },
  },
  {
    key: "C7-SOC-EVID", criterion: "C7", dimension: "social", type: "evidence", relatedQuestions: ["C7-Q3", "C7-Q4"],
    when: (d) => lowConf(d),
    en: { title: "Attach impact and consent records", weakness: "Impact and beneficiary voice are described but not documented.", why: "Impact must be demonstrated, and stories need recorded consent.", action: "Attach impact measurement data and consent records.", steps: ["Collect baseline and follow-up data.", "Keep consent records for every shared story.", "Attach both."], evidence: ["Impact measurement data", "Consent records"] },
    ar: { title: "أرفق سجلات الأثر والموافقات", weakness: "الأثر وصوت المستفيدين موصوفان لكنهما غير موثقين.", why: "يجب إثبات الأثر، والقصص تحتاج موافقات مسجلة.", action: "أرفق بيانات قياس الأثر وسجلات الموافقة.", steps: ["اجمع بيانات خط الأساس والمتابعة.", "احتفظ بسجل موافقة لكل قصة منشورة.", "أرفق الاثنين."], evidence: ["بيانات قياس الأثر", "سجلات الموافقة"] },
  },
  // ===== C8 Exit Strategy =====
  {
    key: "C8-COM-ADOPT", criterion: "C8", dimension: "commercial", type: "performance", relatedQuestions: ["C8-Q1"],
    when: (_d, a) => ans(a, "C8-Q1", 2, 3, 4),
    en: { title: "Identify organisations that could adopt or partner", weakness: "No specific organisations that could adopt or co-operate the project have been identified.", why: "Continuity and scale depend on counterparts.", action: "List companies, associations, or government bodies that could adopt or partner, and contact the most relevant.", steps: ["List candidate organisations.", "Rank them by fit with the mission.", "Contact the top few and record the outcome."], evidence: ["Contact log", "Letters of interest"] },
    ar: { title: "حدِّد جهات يمكن أن تتبنى المشروع أو تشارك فيه", weakness: "لم يتم تحديد جهات بعينها يمكن أن تتبنى المشروع أو تشارك في تشغيله.", why: "الاستمرار والتوسع يعتمدان على وجود جهات شريكة.", action: "اكتب الشركات أو الجمعيات أو الجهات الحكومية التي يمكن أن تتبنى المشروع أو تشارك فيه، وتواصل مع الأنسب.", steps: ["اكتب قائمة الجهات المرشحة.", "رتِّبها حسب توافقها مع الرسالة.", "تواصل مع أفضلها وسجِّل النتيجة."], evidence: ["سجل التواصل", "خطابات اهتمام"] },
  },
  {
    key: "C8-COM-PATH", criterion: "C8", dimension: "commercial", type: "performance", relatedQuestions: ["C8-Q2"],
    when: (_d, a) => ans(a, "C8-Q2", 4, 5),
    en: { title: "Choose a continuity or growth pathway", weakness: "There is no clear picture of how the project will continue or grow.", why: "Without a pathway the project's future depends on the founders alone.", action: "Choose a pathway (partnership, adoption, contracting, handover) and outline the steps.", steps: ["Compare the possible pathways.", "Choose one that fits the mission.", "Write the first steps and a timeline."], evidence: ["Continuity plan"] },
    ar: { title: "اختر مساراً للاستمرار أو التوسع", weakness: "لا يوجد تصور واضح لكيفية استمرار المشروع أو توسعه.", why: "دون مسار يعتمد مستقبل المشروع على المؤسسين وحدهم.", action: "اختر مساراً (شراكة، تبنٍّ، تعاقد، نقل إدارة) واكتب خطواته.", steps: ["قارن المسارات الممكنة.", "اختر ما يناسب الرسالة.", "اكتب الخطوات الأولى وجدولاً زمنياً."], evidence: ["خطة الاستمرار"] },
  },
  {
    key: "C8-COM-MISSION", criterion: "C8", dimension: "commercial", type: "performance", relatedQuestions: ["C8-Q2"], relatedFlags: ["mission_preservation"],
    when: (d) => has(d, "mission_preservation"),
    en: { title: "Protect the mission in any adoption", weakness: "Adoption by another organisation could change or drop the social mission.", why: "Continuity of the business is not enough if beneficiaries lose the benefit.", action: "Define conditions that protect beneficiaries and the mission in any adoption agreement.", steps: ["List what must not change for beneficiaries.", "Turn it into agreement clauses.", "Discuss them early with potential adopters."], evidence: ["Draft terms or MoU clauses"] },
    ar: { title: "احمِ الرسالة في أي تبنٍّ للمشروع", weakness: "تبني جهة أخرى للمشروع قد يغير الرسالة الاجتماعية أو يلغيها.", why: "استمرار النشاط التجاري لا يكفي إذا فقد المستفيدون الفائدة.", action: "حدِّد شروطاً تحمي المستفيدين والرسالة في أي اتفاق تبنٍّ.", steps: ["اكتب ما يجب ألا يتغير للمستفيدين.", "حوِّله إلى بنود اتفاق.", "ناقشها مبكراً مع الجهات المحتملة."], evidence: ["مسودة شروط أو بنود مذكرة تفاهم"] },
  },
  {
    key: "C8-COM-EVID", criterion: "C8", dimension: "commercial", type: "evidence", relatedQuestions: ["C8-Q1", "C8-Q2"],
    when: (d) => lowConf(d),
    en: { title: "Document interest from potential adopters", weakness: "Interest from organisations is stated but not documented.", why: "Named, written interest is what makes a continuity pathway credible.", action: "Attach letters of interest or meeting records and a continuity plan.", steps: ["Ask interested organisations for a short letter.", "Record meetings and outcomes.", "Attach the plan."], evidence: ["Letters of interest or MoUs", "Meeting records", "Continuity plan"] },
    ar: { title: "وثِّق اهتمام الجهات المحتملة", weakness: "اهتمام الجهات مذكور لكنه غير موثق.", why: "الاهتمام المكتوب من جهات محددة هو ما يجعل مسار الاستمرار موثوقاً.", action: "أرفق خطابات اهتمام أو محاضر اجتماعات وخطة الاستمرار.", steps: ["اطلب من الجهات المهتمة خطاباً قصيراً.", "سجِّل الاجتماعات ونتائجها.", "أرفق الخطة."], evidence: ["خطابات اهتمام أو مذكرات تفاهم", "محاضر اجتماعات", "خطة الاستمرار"] },
  },
  {
    key: "C8-SOC-MGMT", criterion: "C8", dimension: "social", type: "performance", relatedQuestions: ["C8-Q3"],
    when: (_d, a) => ans(a, "C8-Q3", 2, 3, 4),
    en: { title: "Prepare beneficiaries to manage activities", weakness: "Management and operations depend mainly on the founders.", why: "If the founders leave, the mission stops.", action: "Build a transition plan: train beneficiaries in specific management functions, step by step.", steps: ["List the management functions.", "Assign each to a beneficiary with training.", "Hand over one function at a time."], evidence: ["Transition plan", "Records of delegated functions"] },
    ar: { title: "جهِّز المستفيدين لإدارة الأنشطة", weakness: "الإدارة والتشغيل يعتمدان أساساً على المؤسسين.", why: "إذا غاب المؤسسون تتوقف الرسالة.", action: "ضع خطة انتقال: درِّب المستفيدين على مهام إدارية محددة خطوة بخطوة.", steps: ["اكتب المهام الإدارية.", "أسند كل مهمة لمستفيد مع تدريبه.", "سلِّم مهمة واحدة في كل مرة."], evidence: ["خطة الانتقال", "سجلات المهام المفوضة"] },
  },
  {
    key: "C8-SOC-CONT", criterion: "C8", dimension: "social", type: "performance", relatedQuestions: ["C8-Q4"],
    when: (_d, a) => ans(a, "C8-Q4", 3, 4),
    en: { title: "Make beneficiaries' work continue without the founders", weakness: "Work would likely stop without the founders, or there is no continuity plan.", why: "Beneficiary independence is the social form of a successful exit.", action: "Create beneficiary leadership roles and test periods of operation without the founders.", steps: ["Name beneficiary leaders.", "Run a short period without founder involvement.", "Record whether work and income continued."], evidence: ["Records of beneficiary-led periods with continued income"] },
    ar: { title: "اجعل عمل المستفيدين يستمر دون المؤسسين", weakness: "العمل سيتوقف غالباً في غياب المؤسسين، أو لا توجد خطة للاستمرار.", why: "استقلال المستفيدين هو الشكل الاجتماعي للخروج الناجح.", action: "أنشئ أدواراً قيادية للمستفيدين وجرِّب فترات تشغيل دون المؤسسين.", steps: ["حدِّد قادة من المستفيدين.", "نفِّذ فترة قصيرة دون تدخل المؤسسين.", "سجِّل هل استمر العمل والدخل."], evidence: ["سجلات فترات قادها المستفيدون مع استمرار الدخل"] },
  },
  {
    key: "C8-SOC-PARTNER", criterion: "C8", dimension: "social", type: "performance", relatedQuestions: ["C8-Q4"],
    when: (_d, a) => ans(a, "C8-Q4", 2),
    en: { title: "Formalise and reduce dependence on a supporting partner", weakness: "Continuity depends on an external partner or supporting body.", why: "If the partner leaves, continuity is at risk.", action: "Formalise the partner's role and plan to reduce the dependency over time.", steps: ["Agree the partner's role in writing.", "Define which tasks beneficiaries will take over.", "Set a timeline."], evidence: ["Partner agreement", "Dependency reduction plan"] },
    ar: { title: "نظِّم دور الشريك الداعم وقلِّل الاعتماد عليه", weakness: "الاستمرار يعتمد على شريك أو جهة داعمة خارجية.", why: "إذا انسحب الشريك يصبح الاستمرار في خطر.", action: "وثِّق دور الشريك وخطِّط لتقليل الاعتماد عليه بمرور الوقت.", steps: ["اتفق على دور الشريك كتابةً.", "حدِّد المهام التي سيتولاها المستفيدون.", "ضع جدولاً زمنياً."], evidence: ["اتفاق مع الشريك", "خطة تقليل الاعتماد"] },
  },
  {
    key: "C8-SOC-EVID", criterion: "C8", dimension: "social", type: "evidence", relatedQuestions: ["C8-Q3", "C8-Q4"],
    when: (d) => lowConf(d),
    en: { title: "Document beneficiaries' independence", weakness: "Beneficiaries' ability to manage and continue is described but not documented.", why: "Independence must be shown in practice.", action: "Keep records of periods when beneficiaries ran activities and a governance plan.", steps: ["Record who managed what and when.", "Record income during those periods.", "Attach a governance or handover plan."], evidence: ["Records of beneficiary-managed periods", "Governance or handover plan"] },
    ar: { title: "وثِّق استقلال المستفيدين", weakness: "قدرة المستفيدين على الإدارة والاستمرار موصوفة لكنها غير موثقة.", why: "الاستقلال يُثبت بالممارسة.", action: "احتفظ بسجلات الفترات التي أدار فيها المستفيدون الأنشطة وبخطة للحوكمة.", steps: ["سجِّل من أدار ماذا ومتى.", "سجِّل الدخل خلال تلك الفترات.", "أرفق خطة حوكمة أو تسليم."], evidence: ["سجلات الفترات التي أدارها المستفيدون", "خطة حوكمة أو تسليم"] },
  },
];

/** Generic, criterion-parameterised templates for information gaps and conflicts. */
export function infoTemplate(criterionNameEn: string, criterionNameAr: string): { ar: RecText; en: RecText } {
  return {
    en: { title: `Complete the missing information for ${criterionNameEn}`, weakness: `Some ${criterionNameEn} questions are answered "not yet known" or "not yet determined", so this part is Not Scored.`, why: "Unknown information is not treated as weak performance, but a reliable result is not possible until it is known.", action: "Find the missing information and update your answers.", steps: ["Review the questions marked unknown.", "Collect the information (records, interviews, calculation).", "Update your answers and reassess."], evidence: ["Updated answers supported by records or data"] },
    ar: { title: `استكمل المعلومات الناقصة في ${criterionNameAr}`, weakness: `بعض أسئلة ${criterionNameAr} أُجيبت بـ"لسه مش عارفين" أو "لم يُحدَّد بعد"، لذلك هذا الجزء غير مُقيَّم.`, why: "المعلومة المجهولة لا تُعامل كأداء ضعيف، لكن لا يمكن الوصول إلى نتيجة موثوقة حتى تُعرف.", action: "ابحث عن المعلومات الناقصة وحدِّث إجاباتك.", steps: ["راجع الأسئلة المجاب عنها بأنها غير معروفة.", "اجمع المعلومات (سجلات، مقابلات، حسابات).", "حدِّث إجاباتك وأعد التقييم."], evidence: ["إجابات محدَّثة مدعومة بسجلات أو بيانات"] },
  };
}

export function conflictTemplate(criterionNameEn: string, criterionNameAr: string): { ar: RecText; en: RecText } {
  return {
    en: { title: `Resolve conflicting answers in ${criterionNameEn}`, weakness: `Answers in ${criterionNameEn} contradict each other, so this part is Not Scored until the conflict is resolved.`, why: "The platform does not guess which answer is right; it needs clarification or evidence.", action: "Review the conflicting answers, correct whichever is inaccurate, and attach evidence.", steps: ["Re-read the related questions together.", "Correct the answer that does not reflect reality.", "Attach evidence that supports the corrected answer."], evidence: ["Corrected answers", "Supporting documents"] },
    ar: { title: `عالج الإجابات المتعارضة في ${criterionNameAr}`, weakness: `إجابات ${criterionNameAr} تتعارض مع بعضها، لذلك هذا الجزء غير مُقيَّم حتى يُحَل التعارض.`, why: "المنصة لا تخمّن أي الإجابات صحيحة؛ بل تحتاج توضيحاً أو دليلاً.", action: "راجع الإجابات المتعارضة، وصحِّح غير الدقيقة منها، وأرفق دليلاً.", steps: ["اقرأ الأسئلة المرتبطة معاً.", "صحِّح الإجابة التي لا تعكس الواقع.", "أرفق دليلاً يدعم الإجابة المصححة."], evidence: ["إجابات مصححة", "مستندات داعمة"] },
  };
}
