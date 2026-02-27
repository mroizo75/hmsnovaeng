import { HelpContent } from "@/components/dashboard/page-help-dialog";

export const helpContent: Record<string, HelpContent> = {
  documents: {
    title: "Document Management",
    description: "How to use the document module to build your quality assurance system",
    sections: [
      {
        heading: "What is document management?",
        emoji: "📚",
        content:
          "Documents are the very foundation of your EHS and quality system. Here you store all governing documents that define how you work: policies, procedures, work instructions, checklists, and templates. This is your quality assurance system.",
      },
      {
        heading: "Why do you need this?",
        emoji: "🎯",
        items: [
          {
            title: "Consistent work methodology",
            description:
              "Ensures that everyone in the organization works the same way and follows the same standards.",
          },
          {
            title: "Traceability and audit",
            description:
              "Documents what has been done, when, and by whom. Important for internal control and external audits.",
          },
          {
            title: "Knowledge transfer",
            description:
              "New employees can quickly learn the correct procedures by reading the documents.",
          },
          {
            title: "ISO requirements met",
            description:
              "All ISO standards require a documented management system with controlled processes.",
          },
        ],
      },
      {
        heading: "How to use the module?",
        emoji: "🔧",
        items: [
          {
            title: "1. Start with templates",
            description:
              "Use ready-made templates to quickly get started with procedures, instructions, and policies.",
          },
          {
            title: "2. Version control",
            description:
              "The system automatically tracks all versions. You can always go back to previous versions.",
          },
          {
            title: "3. Approval workflow",
            description:
              "Send documents for approval before they are activated. This ensures quality and compliance.",
          },
          {
            title: "4. Regular review",
            description:
              "Set up reminders for revisions. Documents should be reviewed at minimum annually.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Quality): Clause 7.5 - Documented information",
      "ISO 14001 (Environment): Clause 7.5 - Documented environmental procedures",
      "ISO 45001 (EHS): Clause 7.5 - Documented EHS procedures",
      "ISO 27001 (IT Security): Clause 7.5 - ISMS documentation",
    ],
    tips: [
      "Start by creating a document hierarchy: Policy → Procedure → Instruction",
      "Use clear and simple language that everyone in the organization understands",
      "Link documents to risks, goals, and actions for a comprehensive overview",
      "Assign an owner and review interval to each document",
      "Train employees on new and updated procedures",
    ],
  },

  legalRegister: {
    title: "Legal Register",
    description: "Overview of laws and regulations applicable to your organization based on industry",
    sections: [
      {
        heading: "What is shown here?",
        emoji: "📋",
        content:
          "The list shows laws and regulations that are relevant to your industry. The links open official government sources where you can read the full legal text.",
      },
      {
        heading: "Important note on legal responsibility",
        emoji: "⚠️",
        content:
          "This is an overview and guidance only. The system does not constitute legal advice. For specific questions about laws and regulations, consult a lawyer or check with your regulatory authority.",
      },
    ],
  },

  risks: {
    title: "Risk Management",
    description: "Identify, assess, and manage risks in your organization",
    sections: [
      {
        heading: "What is risk management?",
        emoji: "⚠️",
        content:
          "Risk management is about identifying what can go wrong, assessing how serious it can be, and implementing actions to prevent or reduce the consequences. This applies to everything from workplace accidents to environmental damage and business risk.",
      },
      {
        heading: "Should actions in a risk assessment be closed?",
        emoji: "1️⃣",
        content:
          "Yes. Actions created in a risk assessment must be followed up and closed when they have been implemented and verified (ISO 45001 clause 6.1 and 8.1, ISO 9001 clause 6.1). The requirement is: Identify risk → assess risk → plan actions → implement actions → evaluate effect. If actions are not closed, you cannot document that the risk has been reduced.",
        items: [
          {
            title: "Correct practice in EHS Nova",
            description:
              "1) Risk is registered. 2) Action is created with responsible person and deadline. 3) Action is implemented. 4) Risk is re-evaluated. 5) Action is set to closed. 6) Effect is documented. The action is closed – the risk assessment itself is not closed, it is revised.",
          },
        ],
      },
      {
        heading: "Why is it important?",
        emoji: "🛡️",
        items: [
          {
            title: "Prevent injuries and losses",
            description:
              "Reduces the likelihood of accidents, environmental incidents, and financial loss.",
          },
          {
            title: "Legally required",
            description:
              "The Occupational Safety Act and EHS regulations require systematic risk management.",
          },
          {
            title: "ISO requirements",
            description:
              "All relevant ISO standards require structured risk management.",
          },
          {
            title: "Better decisions",
            description:
              "Helps management make informed decisions about resource allocation and priorities.",
          },
        ],
      },
      {
        heading: "How to work with risks",
        emoji: "📊",
        items: [
          {
            title: "1. Identify risks",
            description:
              "Map all potential hazards: physical, chemical, ergonomic, psychosocial, environmental, and business risks.",
          },
          {
            title: "2. Assess likelihood and consequence",
            description:
              "Use a risk matrix (5×5 or equivalent) to rank the risks.",
          },
          {
            title: "3. Determine actions",
            description:
              "Prioritize high risks. Use preventive actions (eliminate, reduce) before protective measures (PPE).",
          },
          {
            title: "4. Follow up",
            description:
              "Verify that actions are working and that residual risk is acceptable. Re-evaluate annually or upon changes. Close actions when implemented.",
          },
        ],
      },
      {
        heading: "What should be closed – and what should not?",
        emoji: "3️⃣",
        items: [
          {
            title: "Actions in risk assessment",
            description: "✅ Yes – when implemented and verified.",
          },
          {
            title: "Deviations",
            description: "✅ Yes – after corrective actions and verification.",
          },
          {
            title: "Risk assessment",
            description: "❌ No – it is revised, not closed.",
          },
          {
            title: "System documents",
            description: "❌ No – they are version controlled.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 31000: Risk assessment – principles and guidelines",
      "ISO 9001 (Quality): Clause 6.1 - Risk-based thinking",
      "ISO 14001 (Environment): Clause 6.1.2 - Environmental aspects and risk assessment",
      "ISO 45001 (EHS): Clause 6.1.2 - Hazard identification and risk assessment",
      "ISO 27001 (IT Security): Clause 6.1.2 - Information security risk assessment",
    ],
    tips: [
      "Involve employees – they know best the hazards in their work",
      "Use safety walks, EHS meetings, and inspections to identify risks",
      "Document both the risks and the actions thoroughly",
      "Close actions when implemented – otherwise you cannot document reduced risk",
      "Re-evaluate the risk after actions – fill in residual risk (L×C after actions)",
      "ISO PDCA: Risk = Plan, Actions = Do, Control = Check, Improvement = Act",
    ],
  },

  inspections: {
    title: "Inspections and Safety Walks",
    description: "Conduct systematic reviews of the work environment",
    sections: [
      {
        heading: "What are inspections?",
        emoji: "🔍",
        content:
          "Inspections are systematic reviews to uncover risks, deviations, and areas for improvement. Safety walks are a form of inspection where safety representatives and management walk through work areas together.",
      },
      {
        heading: "Why conduct inspections?",
        emoji: "✅",
        items: [
          {
            title: "Legally required",
            description:
              "The Occupational Safety Act requires employers to conduct systematic inspections.",
          },
          {
            title: "Prevent accidents",
            description:
              "Detects hazards and weaknesses before they lead to injuries or losses.",
          },
          {
            title: "Documentation",
            description:
              "Proves that you have internal control and meet legal requirements.",
          },
          {
            title: "Continuous improvement",
            description:
              "Identifies opportunities for improvement in work processes and equipment.",
          },
        ],
      },
      {
        heading: "How to conduct inspections",
        emoji: "📝",
        items: [
          {
            title: "1. Use checklists",
            description:
              "Create templates based on work area, equipment, or process. EHS Nova has ready-made templates.",
          },
          {
            title: "2. Involve employees",
            description:
              "Include safety representatives and employees who know the area well.",
          },
          {
            title: "3. Take photos",
            description:
              "Document deviations with photos. Easier to follow up and communicate.",
          },
          {
            title: "4. Follow up",
            description:
              "Register deviations and actions. Assign responsible person and deadline. Follow up until closed.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 45001 (EHS): Clause 9.1 - Monitoring, measurement, analysis and evaluation",
      "ISO 14001 (Environment): Clause 9.1 - Environmental monitoring",
      "ISO 9001 (Quality): Clause 9.1 - Monitoring of quality processes",
    ],
    tips: [
      "Conduct inspections regularly (weekly, monthly, or quarterly)",
      "Vary frequency based on risk: high-risk areas more often",
      "Use the mobile feature to conduct safety walks out in the field",
      "Follow up deviations systematically – close them when actions are completed",
      "Review inspection results in management meetings and EHS committees",
    ],
  },

  incidents: {
    title: "Incidents and Deviations",
    description: "Register and follow up on unwanted incidents",
    sections: [
      {
        heading: "What is an incident?",
        emoji: "🚨",
        content:
          "An incident is an unwanted or unexpected event that has, or could have, led to harm to people, the environment, property, or reputation. This includes accidents, near-misses, environmental incidents, and deviations from procedures.",
      },
      {
        heading: "Should deviations be closed?",
        emoji: "2️⃣",
        content:
          "Yes – deviations must be closed. A deviation must: 1) Be registered. 2) Be assessed. 3) Have root cause analysis (if needed). 4) Receive corrective actions. 5) Actions are implemented. 6) Effect is verified. 7) Deviation is closed. This is an explicit requirement in ISO 9001 clause 10.2 and ISO 45001 clause 10.2. If deviations are not closed, an auditor will ask: How do you know the problem is actually solved? An open deviation means the system is not working.",
        items: [
          {
            title: "For an audit-strong system in EHS Nova",
            description:
              "Status: Open → Under investigation → Actions implemented → Closed. Check: Root cause assessed? Actions created? Effect verified? Close with date and who approved. This is what regulatory inspectors and ISO auditors look for.",
          },
        ],
      },
      {
        heading: "Why register incidents?",
        emoji: "📋",
        items: [
          {
            title: "Legal requirement",
            description:
              "The Occupational Safety Act requires employers to investigate accidents and near-misses.",
          },
          {
            title: "Learn from mistakes",
            description:
              "Identify root causes and implement actions to prevent recurrence.",
          },
          {
            title: "Trend analysis",
            description:
              "See patterns and prioritize efforts in high-risk areas.",
          },
          {
            title: "Improvement",
            description:
              "Incident reporting is the foundation for continuous improvement.",
          },
        ],
      },
      {
        heading: "How to handle deviations (ISO 10.2)",
        emoji: "🔧",
        items: [
          {
            title: "1. Register quickly",
            description:
              "Report the incident as soon as possible. The faster, the better the quality of information.",
          },
          {
            title: "2. Investigate and analyze root causes",
            description:
              "Conduct an investigation to find root causes, not just symptoms. Use e.g. 5 Whys or Fishbone.",
          },
          {
            title: "3. Implement actions",
            description:
              "Register concrete actions with responsible person and deadline. Follow up until all actions are completed.",
          },
          {
            title: "4. Close the deviation",
            description:
              "When actions are implemented and effect is verified: Close the deviation. Document effectiveness assessment and who approved closure.",
          },
        ],
      },
      {
        heading: "What should be closed – and what should not?",
        emoji: "3️⃣",
        items: [
          {
            title: "Actions in risk assessment",
            description: "✅ Yes – when implemented and verified.",
          },
          {
            title: "Deviations",
            description: "✅ Yes – after corrective actions and verification.",
          },
          {
            title: "Risk assessment",
            description: "❌ No – it is revised, not closed.",
          },
          {
            title: "System documents",
            description: "❌ No – they are version controlled.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 45001 (EHS): Clause 10.2 - Incidents, deviations and corrective actions",
      "ISO 14001 (Environment): Clause 10.2 - Environmental incidents and corrective actions",
      "ISO 9001 (Quality): Clause 10.2 - Deviations and corrective actions",
      "ISO 27001 (IT Security): Clause 16 - Management of information security incidents",
    ],
    tips: [
      "Create a culture where it is safe to report incidents",
      "Focus on system failures, not personal blame",
      "Close deviations when actions are implemented and effect is verified",
      "An open deviation = the system is not working – an auditor will ask questions",
      "ISO PDCA: If you do not close deviations and actions, the cycle stops.",
    ],
  },

  actions: {
    title: "Actions and Tasks",
    description: "Manage corrective and preventive actions",
    sections: [
      {
        heading: "What are actions?",
        emoji: "✅",
        content:
          "Actions are concrete steps to resolve deviations, reduce risks, or improve processes. They can be corrective (fixing errors) or preventive (preventing something from happening).",
      },
      {
        heading: "Should actions be closed?",
        emoji: "1️⃣",
        content:
          "Yes. Actions must be closed when they have been implemented and verified. ISO 45001 clause 6.1 and 8.1, ISO 9001 clause 6.1. If actions are not closed, you cannot document that the risk has been reduced or that the deviation has been resolved. In EHS Nova: mark actions as completed, document effect, and close – this supports the PDCA cycle (Plan–Do–Check–Act) that ISO is built on.",
        items: [
          {
            title: "What should be closed – and what should not?",
            description:
              "Actions: ✅ Yes. Deviations: ✅ Yes. Risk assessment: ❌ No (revised). System documents: ❌ No (version controlled).",
          },
        ],
      },
      {
        heading: "Why systematize actions?",
        emoji: "🎯",
        items: [
          {
            title: "Ensure completion",
            description:
              "With a clear responsible person and deadline, the likelihood of actions being completed increases.",
          },
          {
            title: "Traceability",
            description:
              "You can prove that actions have been initiated, evaluated, and closed.",
          },
          {
            title: "ISO requirements",
            description:
              "All ISO standards require systematic handling of corrective actions.",
          },
          {
            title: "Continuous improvement",
            description:
              "Structured action management drives the organization forward.",
          },
        ],
      },
      {
        heading: "How to work with actions",
        emoji: "📊",
        items: [
          {
            title: "1. Define clearly",
            description:
              "Describe what is to be done, why, and what result you expect.",
          },
          {
            title: "2. Assign responsible person and deadline",
            description:
              "One person must be responsible. Set a realistic deadline.",
          },
          {
            title: "3. Prioritize",
            description:
              "Mark high-priority actions and focus on them first.",
          },
          {
            title: "4. Close when completed",
            description:
              "When the action is implemented: did it work? Is the problem solved? Mark as completed and document the effect. Close the action.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Quality): Clause 10.2 - Deviations and corrective actions",
      "ISO 14001 (Environment): Clause 10.2 - Environmental deviations and corrective actions",
      "ISO 45001 (EHS): Clause 10.2 - Incidents and corrective actions",
      "ISO 27001 (IT Security): Clause A.16.1.6 - Learning from security incidents",
    ],
    tips: [
      "Link actions to risks, incidents, or deviations for full traceability",
      "Use SMART goals: Specific, Measurable, Achievable, Realistic, Time-bound",
      "Set up reminders so responsible persons don't miss the deadline",
      "Review open actions in management meetings and EHS meetings",
      "Close actions when completed and document the result",
    ],
  },

  training: {
    title: "Training",
    description: "Ensure competence and qualifications in the organization",
    sections: [
      {
        heading: "What is training?",
        emoji: "🎓",
        content:
          "Training encompasses all competence building that ensures employees have the necessary knowledge, skills, and attitudes to perform their work safely, effectively, and in compliance with requirements.",
      },
      {
        heading: "Why is training important?",
        emoji: "📚",
        items: [
          {
            title: "Legally required",
            description:
              "The Occupational Safety Act requires employers to provide necessary training.",
          },
          {
            title: "Prevent accidents",
            description:
              "Lack of competence is a common cause of workplace accidents.",
          },
          {
            title: "ISO requirements",
            description:
              "ISO 9001, 14001, 45001, and 27001 require documented competence and training.",
          },
          {
            title: "Better results",
            description:
              "Competent employees deliver higher quality and are more effective.",
          },
        ],
      },
      {
        heading: "How to use the training module",
        emoji: "🔧",
        items: [
          {
            title: "1. Create training matrix",
            description:
              "Map which courses and competencies each position or person needs.",
          },
          {
            title: "2. Register courses",
            description:
              "Enter completed courses with date, duration, and any certificate.",
          },
          {
            title: "3. Set reminders",
            description:
              "Many courses have expiration dates (first aid, hot work, forklift). Set up automatic reminders.",
          },
          {
            title: "4. Review competence",
            description:
              "See an overview of who is missing which courses and plan training.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Quality): Clause 7.2 - Competence",
      "ISO 14001 (Environment): Clause 7.2 - Environmental competence",
      "ISO 45001 (EHS): Clause 7.2 - EHS competence",
      "ISO 27001 (IT Security): Clause 7.2 - Security competence and awareness",
    ],
    tips: [
      "Start by identifying critical competencies for safety and quality",
      "Use both external courses and internal training (on-the-job)",
      "Document all training: who, what, when, duration",
      "Evaluate whether training is effective – test understanding and look at results",
      "Conduct onboarding programs for new employees",
    ],
  },

  audits: {
    title: "Audits",
    description: "Conduct internal audits of the management system",
    sections: [
      {
        heading: "What is an audit?",
        emoji: "🔍",
        content:
          "An audit is a systematic and independent examination to assess whether activities, processes, and results are in compliance with requirements and standards. Internal audits are conducted by your own organization.",
      },
      {
        heading: "Why conduct audits?",
        emoji: "✅",
        items: [
          {
            title: "ISO requirements",
            description:
              "All ISO standards require annual internal audits of the entire management system.",
          },
          {
            title: "Verify compliance",
            description:
              "Ensures that you are actually following your own procedures and meeting legal requirements.",
          },
          {
            title: "Identify areas for improvement",
            description:
              "Reveals weaknesses, inefficiencies, and opportunities for improvement.",
          },
          {
            title: "Prepare for external audit",
            description:
              "Internal audits reveal deviations before certification audits.",
          },
        ],
      },
      {
        heading: "How to conduct audits",
        emoji: "📋",
        items: [
          {
            title: "1. Plan the audit",
            description:
              "Create an annual audit plan. Cover the entire management system over a period.",
          },
          {
            title: "2. Prepare the auditor",
            description:
              "Review relevant documents, previous deviations, and changes since last time.",
          },
          {
            title: "3. Conduct the audit",
            description:
              "Interview personnel, review documents, observe practices. Document findings.",
          },
          {
            title: "4. Report and follow up",
            description:
              "Create audit report, register deviations and actions. Follow up until closed.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Quality): Clause 9.2 - Internal audit",
      "ISO 14001 (Environment): Clause 9.2 - Internal audit of the environmental management system",
      "ISO 45001 (EHS): Clause 9.2 - Internal audit of the EHS system",
      "ISO 27001 (IT Security): Clause 9.2 - Internal audit of ISMS",
      "ISO 19011: Guidelines for auditing management systems",
    ],
    tips: [
      "Use auditors who do not have responsibility for the area being audited",
      "Train your internal auditors in audit techniques",
      "Focus on both compliance and effectiveness of processes",
      "Involve employees – this is a learning opportunity, not punishment",
      "Review audit findings in the management review",
    ],
  },

  goals: {
    title: "Goals and Targets",
    description: "Set and follow up on the organization's EHS, quality, and environmental goals",
    sections: [
      {
        heading: "What are goals?",
        emoji: "🎯",
        content:
          "Goals are concrete, measurable results the organization wants to achieve within EHS, quality, environment, or business areas. Good goals provide direction and make it possible to measure progress.",
      },
      {
        heading: "Why set goals?",
        emoji: "📈",
        items: [
          {
            title: "ISO requirements",
            description:
              "ISO 9001, 14001, 45001, and 27001 require the organization to set measurable goals.",
          },
          {
            title: "Provide direction",
            description:
              "Clear goals give the entire organization a common direction and priorities.",
          },
          {
            title: "Measure progress",
            description:
              "Without goals, you don't know if you are succeeding or if the actions are working.",
          },
          {
            title: "Engage employees",
            description:
              "Involvement in goal-setting increases motivation and ownership.",
          },
        ],
      },
      {
        heading: "How to work with goals",
        emoji: "🔧",
        items: [
          {
            title: "1. Use SMART criteria",
            description:
              "Specific, Measurable, Achievable, Realistic, Time-bound. E.g.: 'Reduce incident rate to below 3.0 by 12/31/2026'.",
          },
          {
            title: "2. Link to risks and actions",
            description:
              "Goals should address identified risks and be supported by concrete actions.",
          },
          {
            title: "3. Follow up regularly",
            description:
              "Goals must be measured and reported quarterly or more often. Adjust course as needed.",
          },
          {
            title: "4. Review in management",
            description:
              "Goal achievement should be a standing item in the management review.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Quality): Clause 6.2 - Quality objectives",
      "ISO 14001 (Environment): Clause 6.2 - Environmental objectives",
      "ISO 45001 (EHS): Clause 6.2 - EHS objectives",
      "ISO 27001 (IT Security): Clause 6.2 - Information security objectives",
    ],
    tips: [
      "Set few but important goals – better to have 5 good ones than 20 unclear ones",
      "Involve both management and employees in the goal-setting process",
      "Link goals to the organization's strategy and values",
      "Use key performance indicators (KPIs) to measure progress",
      "Celebrate when goals are reached – this motivates further effort",
    ],
  },

  meetings: {
    title: "Meetings",
    description: "Document EHS meetings, safety representative meetings, and management reviews",
    sections: [
      {
        heading: "What is meeting follow-up?",
        emoji: "🗓️",
        content:
          "Meetings are important forums for dialogue about EHS, quality, and environment. Structured meeting follow-up ensures that decisions are documented and followed up.",
      },
      {
        heading: "Why document meetings?",
        emoji: "📝",
        items: [
          {
            title: "Legal requirement",
            description:
              "The Occupational Safety Act requires written minutes from safety committee and safety representative meetings.",
          },
          {
            title: "Decision traceability",
            description:
              "Documents which decisions have been made, by whom, and why.",
          },
          {
            title: "Follow-up",
            description:
              "Meeting minutes ensure that actions and tasks are followed up before the next meeting.",
          },
          {
            title: "ISO requirements",
            description:
              "The management review must be thoroughly documented.",
          },
        ],
      },
      {
        heading: "How to use the meeting module",
        emoji: "✅",
        items: [
          {
            title: "1. Create meeting",
            description:
              "Register meeting type, participants, date, and agenda in advance.",
          },
          {
            title: "2. Document during the meeting",
            description:
              "Enter items, decisions, and actions directly in the system during the meeting.",
          },
          {
            title: "3. Generate minutes",
            description:
              "The system automatically creates structured meeting minutes that can be shared.",
          },
          {
            title: "4. Follow up actions",
            description:
              "Actions from meetings are linked to the action module and followed up there.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Quality): Clause 9.3 - Management review",
      "ISO 14001 (Environment): Clause 9.3 - Management review of the environmental system",
      "ISO 45001 (EHS): Clause 9.3 - Management review of the EHS system",
      "ISO 27001 (IT Security): Clause 9.3 - Management review of ISMS",
    ],
    tips: [
      "Hold regular EHS meetings (monthly or quarterly)",
      "Management review should be held at minimum annually",
      "Involve safety representatives in all EHS-related meetings",
      "Review status of goals, risks, incidents, and actions at each meeting",
      "Distribute minutes quickly to all participants",
    ],
  },

  "management-reviews": {
    title: "Management Review",
    description: "Conduct systematic evaluation of the management system",
    sections: [
      {
        heading: "What is a management review?",
        emoji: "👔",
        content:
          "The Management Review is a formal meeting where top management reviews the performance, effectiveness, and results of the management system. This is management's most important tool for ensuring the system works and improves.",
      },
      {
        heading: "Why is it important?",
        emoji: "🎯",
        items: [
          {
            title: "ISO requirements",
            description:
              "All ISO standards require top management to review the system at minimum annually.",
          },
          {
            title: "Management responsibility",
            description:
              "Demonstrates that management takes responsibility for EHS, quality, and environment.",
          },
          {
            title: "Strategic management tool",
            description:
              "Gives management an overview and basis for strategic decisions.",
          },
          {
            title: "Continuous improvement",
            description:
              "Identifies areas for improvement and sets direction for the future.",
          },
        ],
      },
      {
        heading: "What should be reviewed?",
        emoji: "📊",
        items: [
          {
            title: "1. Input from previous review",
            description:
              "Follow-up on actions and decisions from the previous management review.",
          },
          {
            title: "2. Goal achievement and KPIs",
            description:
              "Status on EHS, quality, and environmental goals. Key figures and trends.",
          },
          {
            title: "3. Audits and deviations",
            description:
              "Results from internal and external audits, as well as status on corrective actions.",
          },
          {
            title: "4. Changes and risks",
            description:
              "Relevant changes in organization, laws, market. Updated risk assessment.",
          },
          {
            title: "5. Resources and competence",
            description:
              "Assessment of whether the system has sufficient resources to function.",
          },
          {
            title: "6. Opportunities for improvement",
            description:
              "Identify areas for improvement and decide on new actions.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Quality): Clause 9.3 - Management review",
      "ISO 14001 (Environment): Clause 9.3 - Management review",
      "ISO 45001 (EHS): Clause 9.3 - Management review",
      "ISO 27001 (IT Security): Clause 9.3 - Management review",
    ],
    tips: [
      "Conduct at minimum once a year, preferably twice",
      "Prepare thoroughly – the system can auto-populate much of the data",
      "Involve top management – this should not be delegated",
      "Focus on both results and the system's suitability",
      "Document decisions and actions clearly",
      "Follow up actions from the meeting systematically",
    ],
  },

  chemicals: {
    title: "Chemical Management",
    description: "Manage chemicals and safety data sheets",
    sections: [
      {
        heading: "What is chemical management?",
        emoji: "⚗️",
        content:
          "Chemical management is about having an overview of all chemicals in the organization, assessing risk during use, and ensuring safe handling through procedures, PPE, and training.",
      },
      {
        heading: "Why is it important?",
        emoji: "⚠️",
        items: [
          {
            title: "Legally required",
            description:
              "Chemical regulations require mapping, risk assessment, and safety data sheets.",
          },
          {
            title: "Health hazards",
            description:
              "Many chemicals can cause acute or chronic health damage.",
          },
          {
            title: "Environmental consequences",
            description:
              "Releases of hazardous chemicals can significantly damage the environment.",
          },
          {
            title: "ISO requirements",
            description:
              "ISO 14001 (environment) and ISO 45001 (EHS) require management of hazardous substances.",
          },
        ],
      },
      {
        heading: "How to use the chemical module",
        emoji: "📋",
        items: [
          {
            title: "1. Register all chemicals",
            description:
              "Enter product name, supplier, and upload safety data sheet (SDS).",
          },
          {
            title: "2. Risk assess the use",
            description:
              "Assess exposure, hazard level, and actions. EHS Nova helps you with structure.",
          },
          {
            title: "3. Define PPE and procedures",
            description:
              "Document what protective equipment and safety measures are required.",
          },
          {
            title: "4. Train personnel",
            description:
              "All who use chemicals must have training. Link to the training module.",
          },
          {
            title: "5. Keep updated",
            description:
              "Safety data sheets must be updated when the supplier sends new versions.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 45001 (EHS): Clause 8.1.3 - Management of hazardous substances",
      "ISO 14001 (Environment): Clause 8.1 - Environmental aspects related to chemicals",
    ],
    tips: [
      "Store safety data sheets digitally and make them accessible to employees",
      "Label chemicals clearly with hazard pictograms",
      "Replace hazardous chemicals with less hazardous alternatives when possible",
      "Review the chemical inventory annually",
      "Link chemicals to risk assessments and inspections",
    ],
  },

  environment: {
    title: "Environmental Management",
    description: "Map and manage environmental aspects and environmental impact",
    sections: [
      {
        heading: "What is environmental management?",
        emoji: "🌍",
        content:
          "Environmental management is about identifying and managing the organization's impact on the environment. This includes energy consumption, emissions, waste, chemical use, and other environmental aspects.",
      },
      {
        heading: "Why work with environmental management?",
        emoji: "♻️",
        items: [
          {
            title: "Legal requirements",
            description:
              "Environmental protection laws and various regulations impose requirements for environmental management.",
          },
          {
            title: "ISO 14001",
            description:
              "Environmental certification requires systematic mapping and improvement of environmental performance.",
          },
          {
            title: "Social responsibility",
            description:
              "Contribute to sustainable development and reduced environmental impact.",
          },
          {
            title: "Economy",
            description:
              "Reduced energy consumption and waste often results in cost savings.",
          },
        ],
      },
      {
        heading: "How to use the environment module",
        emoji: "📊",
        items: [
          {
            title: "1. Identify environmental aspects",
            description:
              "Map all activities that impact the environment: energy, waste, emissions, transport, chemicals.",
          },
          {
            title: "2. Assess significance",
            description:
              "Prioritize the environmental aspects that have the greatest impact or are regulated by law.",
          },
          {
            title: "3. Set environmental goals",
            description:
              "Define concrete goals for reducing environmental impact, e.g. 'Reduce energy consumption by 15% by 2027'.",
          },
          {
            title: "4. Monitor and report",
            description:
              "Measure consumption and emissions regularly. Report progress toward goals.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 14001: Environmental management systems – requirements and guidance",
      "ISO 14004: Guidelines for implementing an environmental management system",
      "ISO 50001: Energy management systems (voluntary)",
    ],
    tips: [
      "Start by mapping the most obvious environmental aspects: waste, energy, transport",
      "Involve employees – they often have good ideas for environmental improvements",
      "Combine environmental and EHS assessments for chemicals",
      "Set up meters to track consumption and emissions over time",
      "Review environmental aspects annually or upon changes",
    ],
  },

  wellbeing: {
    title: "Psychosocial Work Environment",
    description: "Map and improve the psychosocial work environment",
    sections: [
      {
        heading: "What is the psychosocial work environment?",
        emoji: "💚",
        content:
          "The psychosocial work environment encompasses factors such as workload, control, support, role clarification, conflicts, and well-being. It concerns how organization and management affect employees' mental health and well-being.",
      },
      {
        heading: "Why is it important?",
        emoji: "🧠",
        items: [
          {
            title: "Legally required",
            description:
              "The Occupational Safety Act requires employers to prevent psychological and physical health damage.",
          },
          {
            title: "High absenteeism",
            description:
              "Mental health issues are one of the most common causes of long-term sick leave.",
          },
          {
            title: "ISO 45003",
            description:
              "New standard for psychosocial risk management provides guidelines for systematic work.",
          },
          {
            title: "Better results",
            description:
              "Good psychosocial work environment increases engagement, productivity, and well-being.",
          },
        ],
      },
      {
        heading: "How to work with the psychosocial work environment",
        emoji: "🔧",
        items: [
          {
            title: "1. Map with surveys",
            description:
              "Conduct structured surveys on workload, control, support, bullying, and harassment.",
          },
          {
            title: "2. Identify risk factors",
            description:
              "Analyze the responses and identify areas with high strain or risk.",
          },
          {
            title: "3. Involve employees in actions",
            description:
              "Discuss results openly and let employees participate in finding solutions.",
          },
          {
            title: "4. Follow up systematically",
            description:
              "Implement actions, evaluate effect, and repeat the survey regularly (annually or every other year).",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 45003: Psychosocial risk management in the work environment",
      "ISO 45001 (EHS): Also covers psychosocial factors",
      "ISO 10002: Complaints management (also from employees)",
    ],
    tips: [
      "Use validated surveys such as QPSNordic or similar",
      "Conduct the survey anonymously to get honest answers",
      "Communicate results openly to all employees",
      "Combine quantitative data (surveys) with qualitative data (conversations, safety walks)",
      "Conduct the survey annually to track trends",
    ],
  },

  bcm: {
    title: "Business Continuity Management (BCM)",
    description: "Ensure the organization's ability to handle crises and continue operations",
    sections: [
      {
        heading: "What is BCM?",
        emoji: "🛡️",
        content:
          "Business Continuity Management (BCM) is about ensuring that the organization can continue to deliver critical services even during serious incidents such as fire, IT outages, pandemic, or other crises.",
      },
      {
        heading: "Why is it important?",
        emoji: "🚨",
        items: [
          {
            title: "Reduce consequences",
            description:
              "Minimizes loss of time, money, and reputation during crises.",
          },
          {
            title: "Increased resilience",
            description:
              "Makes the organization robust and able to handle the unexpected.",
          },
          {
            title: "ISO 22301",
            description:
              "International standard for continuity management provides a structured framework.",
          },
          {
            title: "Customer trust",
            description:
              "Demonstrates that you take responsibility and are in control.",
          },
        ],
      },
      {
        heading: "How to use the BCM module",
        emoji: "📋",
        items: [
          {
            title: "1. Identify critical processes",
            description:
              "Which processes are essential for delivering services? What happens if they stop?",
          },
          {
            title: "2. Conduct BIA",
            description:
              "Business Impact Analysis: Assess consequences of operational disruptions and define acceptable downtime (RTO).",
          },
          {
            title: "3. Create contingency plans",
            description:
              "Document how you restore operations: backup, alternative equipment, communication.",
          },
          {
            title: "4. Practice and test",
            description:
              "Conduct regular exercises to ensure the plans work.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 22301: Business Continuity Management Systems (BCMS)",
      "ISO 27001 (IT Security): Clause A.17 - Information security in BCM",
    ],
    tips: [
      "Start by identifying 3-5 critical processes",
      "Create contact lists for the crisis team and key personnel",
      "Document backup solutions for IT, premises, and equipment",
      "Conduct at least one BCM exercise per year",
      "Update contingency plans when the organization changes",
    ],
  },

  "annual-hms-plan": {
    title: "Annual EHS Plan",
    description: "Step-by-step checklist that consolidates all legal and standard requirements – check off when each step is completed",
    sections: [
      {
        heading: "What is the annual EHS plan?",
        emoji: "📆",
        content:
          "The annual EHS plan is a checklist of all important EHS requirements for the year. You go step by step through the list and check off when each item is completed. When the entire list is checked off, you have documented that the year's requirements have been met – without having to dig into all the laws and standards yourself.",
      },
      {
        heading: "What requirements does the plan cover?",
        emoji: "⚖️",
        items: [
          {
            title: "Legal requirements",
            description:
              "The Occupational Safety Act, Internal Control Regulations, Regulations on Organization, Leadership and Participation, Chemical Regulations, and Fire/Electrical requirements all require systematic, planned EHS work with documentation.",
          },
          {
            title: "Management review",
            description:
              "At least annually, with documented assessment of goals, results, deviations, risks, resources, and improvement actions.",
          },
          {
            title: "Annual risk assessment",
            description:
              "Systematic review of occupational health risks, including physical, chemical, ergonomic, and psychosocial conditions.",
          },
          {
            title: "Inspection and audit",
            description:
              "Safety walks, internal audits, follow-up of findings and actions, and regular review of documents and chemical register.",
          },
        ],
      },
      {
        heading: "How to use the checklist?",
        emoji: "🔧",
        items: [
          {
            title: "1. Go through steps in sequence",
            description:
              "Read the description and requirement for each step. Complete the work (e.g. conduct management review, update risk assessment) in the associated module.",
          },
          {
            title: "2. Check off when the step is completed",
            description:
              "Check the box in the checklist when you have completed and documented the step. Date and user are automatically saved.",
          },
          {
            title: "3. Use the 'Go to module' links",
            description:
              "Each step has a link to the relevant part of EHS Nova (documents, safety walks, audits, etc.) so you can quickly get to the right place.",
          },
          {
            title: "4. When all steps are checked off",
            description:
              "You have then documented that this year's EHS requirements have been met. Good for both internal control and any certification.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 45001 (EHS): 6.1, 6.2, 9.1, 9.2, 9.3 and 10.2 – planned, systematic EHS work throughout the year",
      "ISO 9001 (Quality): 6.2, 9.1, 9.2 and 9.3 – goals, monitoring, internal audit and management review",
      "ISO 14001 (Environment): 6.1, 6.2, 9.1, 9.2 and 9.3 – environmental aspects, goals, monitoring and management review",
      "ISO 27001 (Information Security): 9.1, 9.2 and 9.3 – monitoring, internal audit and management review",
    ],
    tips: [
      "Use the annual plan as a standing item in management meetings and EHS committees.",
      "Ensure all legally required activities are entered with date and responsible person.",
      "Adjust the frequency of activities based on the organization's risk – higher risk more often.",
      "Use the year's reports (incidents, actions, measurements) as input to the management review.",
      "Evaluate the annual plan each winter and adjust the annual cycle for next year.",
    ],
  },

  security: {
    title: "Information Security",
    description: "Protect information and IT systems against threats",
    sections: [
      {
        heading: "What is information security?",
        emoji: "🔒",
        content:
          "Information security is about protecting the confidentiality, integrity, and availability of information. It encompasses both IT security and the protection of physical documents.",
      },
      {
        heading: "Why is it important?",
        emoji: "🛡️",
        items: [
          {
            title: "Legal requirements",
            description:
              "GDPR and data protection laws require protection of personal data.",
          },
          {
            title: "Cyber threats",
            description:
              "Ransomware, phishing, and data breaches are affecting more and more organizations.",
          },
          {
            title: "ISO 27001",
            description:
              "International standard for information security provides a systematic framework.",
          },
          {
            title: "Trust",
            description:
              "Customers and partners expect their data to be handled securely.",
          },
        ],
      },
      {
        heading: "How to work with information security",
        emoji: "🔐",
        items: [
          {
            title: "1. Map information assets",
            description:
              "Identify which information is critical or sensitive.",
          },
          {
            title: "2. Risk assess threats",
            description:
              "Assess threats such as data breaches, ransomware, errors, fire, theft.",
          },
          {
            title: "3. Implement controls",
            description:
              "Use ISO 27001 Annex A as a checklist for security measures.",
          },
          {
            title: "4. Train employees",
            description:
              "People are often the weakest link. Train employees in secure IT use.",
          },
          {
            title: "5. Test and practice",
            description:
              "Conduct incident exercises and test backup regularly.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 27001: Information security management (ISMS)",
      "ISO 27002: Guidelines for security controls",
      "ISO 27005: Information security risk management",
    ],
    tips: [
      "Start by classifying information by confidentiality level",
      "Implement multi-factor authentication (MFA) on all critical systems",
      "Test backup and recovery procedures regularly",
      "Conduct awareness training against phishing and social engineering",
      "Review access rights regularly – remove access for employees who have left",
    ],
  },

  whistleblowing: {
    title: "Whistleblowing",
    description: "Handle whistleblowing cases in accordance with whistleblower legislation",
    sections: [
      {
        heading: "What is whistleblowing?",
        emoji: "📢",
        content:
          "Whistleblowing is when an employee reports on reprehensible conditions in the organization, such as violations of law, ethical rules, danger to life and health, or environmental damage.",
      },
      {
        heading: "Why is it important?",
        emoji: "⚖️",
        items: [
          {
            title: "Legally required",
            description:
              "The Occupational Safety Act and whistleblower legislation require a whistleblowing system and protection against retaliation.",
          },
          {
            title: "Uncover serious matters",
            description:
              "Whistleblowing can reveal corruption, fraud, EHS violations, or discrimination.",
          },
          {
            title: "Protect the whistleblower",
            description:
              "The system ensures that whistleblowers can report safely without fear of reprisals.",
          },
          {
            title: "Build trust",
            description:
              "Demonstrates that the organization takes responsibility and wants to correct mistakes.",
          },
        ],
      },
      {
        heading: "How to handle whistleblowing cases",
        emoji: "🔧",
        items: [
          {
            title: "1. Ensure confidentiality",
            description:
              "The whistleblower's identity must be protected. Limit access to the case.",
          },
          {
            title: "2. Receive and register",
            description:
              "Log the case securely. Confirm receipt to the whistleblower within a reasonable time.",
          },
          {
            title: "3. Investigate thoroughly",
            description:
              "Conduct an objective investigation. Hear all affected parties.",
          },
          {
            title: "4. Implement actions",
            description:
              "Based on findings: Corrective actions, disciplinary actions, or clarification that nothing wrong occurred.",
          },
          {
            title: "5. Feedback",
            description:
              "Inform the whistleblower of the outcome of the case in accordance with legal requirements.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 37002: Management systems for whistleblowing",
      "ISO 37001: Anti-bribery management",
    ],
    tips: [
      "Create a clear whistleblowing procedure and communicate it to all employees",
      "Offer both an internal channel and an external third party for whistleblowing",
      "Train managers and HR in whistleblowing case handling",
      "Protect the whistleblower against retaliation – this is legally required",
      "Document the entire process thoroughly",
    ],
  },

  complaints: {
    title: "Complaint Handling",
    description: "Handle complaints from customers and stakeholders systematically",
    sections: [
      {
        heading: "What is complaint handling?",
        emoji: "📞",
        content:
          "Complaint handling is about receiving, documenting, and following up on feedback and complaints from customers, users, or other stakeholders in a structured and fair manner.",
      },
      {
        heading: "Why is it important?",
        emoji: "💬",
        items: [
          {
            title: "Customer satisfaction",
            description:
              "Good complaint handling can turn a dissatisfied customer into a loyal ambassador.",
          },
          {
            title: "ISO 10002",
            description:
              "Provides guidelines for effective and transparent complaint handling.",
          },
          {
            title: "Continuous improvement",
            description:
              "Complaints reveal weaknesses in products, services, or processes.",
          },
          {
            title: "Reputation",
            description:
              "How you handle complaints significantly affects your reputation.",
          },
        ],
      },
      {
        heading: "How to handle complaints",
        emoji: "✅",
        items: [
          {
            title: "1. Make it easy to complain",
            description:
              "Clear information on how customers can complain: email, phone, form.",
          },
          {
            title: "2. Receive and confirm",
            description:
              "Confirm receipt of the complaint quickly and inform about the next steps.",
          },
          {
            title: "3. Investigate the case",
            description:
              "Review the complaint objectively. Gather facts and hear affected parties.",
          },
          {
            title: "4. Provide response and solution",
            description:
              "Offer a fair solution. Explain the decision clearly.",
          },
          {
            title: "5. Learn and improve",
            description:
              "Analyze complaints to identify system failures and areas for improvement.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 10002: Customer satisfaction management – complaints handling",
      "ISO 9001 (Quality): Clause 9.1.2 - Customer satisfaction",
    ],
    tips: [
      "Set goals for response times on complaints (e.g. 24 hours for confirmation)",
      "Train employees in good complaint handling and customer service",
      "Analyze complaint data to identify trends and recurring problems",
      "Use complaints as input to improvement work and product development",
      "Follow up with the customer after the case is resolved",
    ],
  },

  feedback: {
    title: "Feedback",
    description: "Receive and follow up on feedback, suggestions, and input",
    sections: [
      {
        heading: "What is feedback?",
        emoji: "💭",
        content:
          "Feedback encompasses all types of input from employees, customers, or other stakeholders: improvement suggestions, praise, observations, or requests.",
      },
      {
        heading: "Why collect feedback?",
        emoji: "🎯",
        items: [
          {
            title: "Engage employees",
            description:
              "Gives employees the opportunity to influence and contribute to improvements.",
          },
          {
            title: "Identify opportunities",
            description:
              "Good ideas can come from all levels of the organization.",
          },
          {
            title: "Continuous improvement",
            description:
              "Structured collection of feedback drives improvement work.",
          },
          {
            title: "ISO spirit",
            description:
              "All ISO standards emphasize improvement based on data and feedback.",
          },
        ],
      },
      {
        heading: "How to use the feedback module",
        emoji: "📝",
        items: [
          {
            title: "1. Make it easy to give feedback",
            description:
              "Clear and accessible form. Low barriers for submission.",
          },
          {
            title: "2. Receive and assess",
            description:
              "Review all feedback. Prioritize those with the greatest potential.",
          },
          {
            title: "3. Follow up",
            description:
              "Provide feedback to the submitter about what is happening with the suggestion.",
          },
          {
            title: "4. Implement good ideas",
            description:
              "Implement actions based on valuable suggestions and recognize contributors.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Quality): Clause 10.3 - Continuous improvement",
      "ISO 45001 (EHS): Clause 5.4 - Consultation and participation of workers",
    ],
    tips: [
      "Acknowledge and thank all feedback",
      "Share good examples of implemented suggestions",
      "Review feedback in management meetings",
      "Celebrate improvements based on employee suggestions",
      "Combine digital forms with physical suggestion boxes",
    ],
  },

  forms: {
    title: "Forms and Templates",
    description: "Create custom forms and checklists for data collection",
    sections: [
      {
        heading: "What are forms?",
        emoji: "📋",
        content:
          "Forms are structured digital questionnaires for systematically collecting data. This can be anything from safety instructions to evaluation forms and surveys.",
      },
      {
        heading: "Why use digital forms?",
        emoji: "✅",
        items: [
          {
            title: "Structured data collection",
            description:
              "Ensures the right information is collected in a consistent manner.",
          },
          {
            title: "Efficiency",
            description:
              "Faster than paper. Data is stored automatically and can be analyzed directly.",
          },
          {
            title: "Traceability",
            description:
              "All submitted forms are stored with timestamp and user information.",
          },
          {
            title: "Flexibility",
            description:
              "Create custom forms tailored to your needs without waiting for a vendor.",
          },
        ],
      },
      {
        heading: "How to use the form builder",
        emoji: "🔧",
        items: [
          {
            title: "1. Create form",
            description:
              "Use the drag-and-drop builder to create forms with various field types.",
          },
          {
            title: "2. Customize and test",
            description:
              "Add instructions, validations, and conditional logic. Test before publishing.",
          },
          {
            title: "3. Publish and share",
            description:
              "Make the form available to the target audience. Link to inspections or processes.",
          },
          {
            title: "4. Analyze responses",
            description:
              "View an overview of submitted responses and use the data in reports.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Quality): Clause 7.5 - Documented information",
      "ISO 45001 (EHS): Structured collection of EHS data",
      "ISO 14001 (Environment): Environmental monitoring and data logging",
    ],
    tips: [
      "Start by digitizing existing paper forms",
      "Use checklists for repetitive tasks (daily safety rounds)",
      "Add help text to explain the questions",
      "Test the form with a colleague before rolling it out",
      "Review collected data regularly to identify trends",
    ],
  },

  settings: {
    title: "Settings",
    description: "Manage user accounts, roles, notifications, and system settings",
    sections: [
      {
        heading: "What are settings?",
        emoji: "⚙️",
        content:
          "Here you manage users, roles, notifications, integrations, and general system settings. This is the control panel for system administrators.",
      },
      {
        heading: "Important features",
        emoji: "🔧",
        items: [
          {
            title: "User administration",
            description:
              "Add new users, define roles (admin, manager, employee), and manage access.",
          },
          {
            title: "Roles and access",
            description:
              "Control who can view, edit, and approve various types of data based on role.",
          },
          {
            title: "Notification setup",
            description:
              "Configure email notifications for incidents, actions, deadlines, and approvals.",
          },
          {
            title: "Organization data",
            description:
              "Update business information, logo, and contact details.",
          },
        ],
      },
      {
        heading: "User import",
        emoji: "📥",
        items: [
          {
            title: "1. Download Excel example",
            description:
              "Click 'Download Excel example' to get a ready-made template with the columns email, name, and role.",
          },
          {
            title: "2. Fill out and import",
            description:
              "Use Excel (.xlsx) or CSV. Valid roles: EMPLOYEE, MANAGER, EHS, SAFETY_REP, OHS, AUDITOR, ADMIN. Users are added without invitation.",
          },
          {
            title: "3. Activate all",
            description:
              "After import: Click 'Activate all' to send an invitation with password to all imported users at once, or activate one by one under Actions.",
          },
        ],
      },
      {
        heading: "Best practices",
        emoji: "💡",
        items: [
          {
            title: "Principle of least privilege",
            description:
              "Give users only the access they need to perform their tasks.",
          },
          {
            title: "Review access regularly",
            description:
              "Remove access for employees who have left or changed roles.",
          },
          {
            title: "Enable notifications",
            description:
              "Ensure that relevant people receive notifications about important events.",
          },
          {
            title: "Enforce strong passwords",
            description:
              "Require complex passwords and consider multi-factor authentication.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 27001 (IT Security): Clause 9.2 - Access control",
      "ISO 27001: Clause 9.4 - Review of user access",
      "GDPR: Requirements for access management and logging",
    ],
    tips: [
      "Use 'Activate all' after import to send invitations to many users at once",
      "Document who has which roles and why",
      "Log all administrative changes for traceability",
      "Test the notification function to ensure emails are delivered",
      "Conduct access review at least once a year",
      "Train new administrators in the system's functions",
    ],
  },
};
