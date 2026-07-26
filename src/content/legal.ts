export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalDocument {
  slug: "terms" | "privacy" | "responsible-gambling" | "aml";
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export const LEGAL_DOCS: Record<"en" | "ru", LegalDocument[]> = {
  en: [
    {
      slug: "terms",
      title: "Terms of Use",
      updated: "July 2026",
      intro:
        "CryptoCasino (this demo) is a non-commercial portfolio demonstration of a casino interface. It holds no gambling licence, accepts no deposits, processes no payments and offers no real-money play; everything shown on screen is simulated.",
      sections: [
        {
          heading: "Demonstration project",
          paragraphs: [
            "This website is a portfolio piece built to demonstrate front-end design and engineering. It is not operated by a gambling company, it is not connected to any gaming platform, and no part of it can be used to place a real wager.",
            "There is no licence, no regulated operator behind the interface and no commercial activity of any kind. Deposits cannot be made, withdrawals cannot be requested, and no funds — in cryptocurrency or any other form — are ever received, held or transferred by the project.",
            "Wallet addresses, transaction histories, bonuses, tournaments and verification screens are illustrative mock-ups. Sending cryptocurrency to any address displayed by this demo would result in a permanent loss for which the project accepts no responsibility.",
          ],
        },
        {
          heading: "Scope and acceptance",
          paragraphs: [
            "These terms describe the basis on which the demonstration is made available to you. By browsing the site or creating a demo account you accept them. If you do not accept them, please stop using the site.",
            "They apply to the interface itself and to the simulated features inside it. They do not create a customer relationship, a gaming contract, or any entitlement to a prize, payout or refund, because nothing of value is ever at stake.",
          ],
        },
        {
          heading: "Eligibility and age",
          paragraphs: [
            "The demonstration depicts gambling content and is intended for adults aged 18 or over, or the higher minimum age that applies where you live. Please do not use it if you are below that age.",
            "Because the project performs no identity verification, this restriction relies on you. Adults who share a device with a minor should use the parental controls in their operating system or browser to restrict access.",
            "You are responsible for ensuring that viewing gambling-themed material is lawful in your location. The project makes no claim that its content is appropriate or available in every jurisdiction.",
          ],
        },
        {
          heading: "Demo accounts",
          paragraphs: [
            "Registration and sign-in flows are simulated. Any account you create exists only in the storage of the browser you are using: it is not transmitted anywhere, it cannot be recovered, and it disappears if you clear your site data or switch device.",
            "Please do not enter real personal details, images of genuine documents, passwords reused from other services, or wallet keys into any field. Use invented values.",
            "The project may change, reset or remove demo features at any time and without notice, and cannot restore a demo account, balance or history that has been lost.",
          ],
        },
        {
          heading: "Virtual balances",
          paragraphs: [
            "All balances, bets, winnings, bonuses, rakeback, loyalty points and tournament prizes shown in the demo are fictional numbers generated locally by the interface. They have no monetary value, cannot be exchanged, sold, transferred or withdrawn, and confer no rights of any kind.",
            "Game outcomes are produced by a pseudo-random generator running in your browser purely for illustration. Return-to-player figures, odds and provably-fair verification screens are presentational and are not statements about any real product.",
          ],
        },
        {
          heading: "Acceptable use",
          paragraphs: [
            "You may browse the demonstration, interact with its simulated features, and inspect it for study or evaluation purposes.",
            "You must not present the site as a genuine gambling service, use it to solicit money or personal data from other people, imply an affiliation with a licensed operator, or use its name, screenshots or code to give a fraudulent scheme an appearance of legitimacy.",
            "You must not attempt to disrupt the site, introduce malicious code, scrape it at a volume that degrades it for other visitors, or bypass any technical restriction.",
          ],
        },
        {
          heading: "Intellectual property",
          paragraphs: [
            "The interface, layout, component library, illustrations, copy and source code of this demonstration are the author's own work and remain the author's property.",
            "No third-party game content is included: there are no licensed slot titles, no game-studio assets, no provider software and no operator branding. Every game name, provider name, logo, tournament and promotion shown is invented for the demonstration, and any resemblance to a real product or brand is unintentional.",
            "Third-party open-source libraries used to build the site remain subject to their own licences.",
          ],
        },
        {
          heading: "No warranties and limitation of liability",
          paragraphs: [
            "The demonstration is provided on an as-is and as-available basis, without warranty of any kind. The project does not promise that it will be accurate, uninterrupted, error-free or secure, nor that locally stored demo data will persist.",
            "Nothing here is financial, legal, tax or gambling advice. Any decision you take about real gambling or real cryptocurrency is entirely your own.",
            "To the fullest extent permitted by law, the author is not liable for any loss or damage arising from use of, or reliance on, the demonstration — including lost data, cryptocurrency sent to displayed addresses, and losses incurred at a real gambling service. Nothing in these terms limits liability that cannot be limited by law.",
          ],
        },
        {
          heading: "Changes to these terms",
          paragraphs: [
            "As the project develops, these terms may be updated. The revised version applies from the moment it is published here, and the month shown at the top of this page indicates when it last changed.",
            "Continuing to use the demonstration after a change means you accept the updated terms.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "Questions about the demonstration, its content or its licensing can be sent through the contact form in the help section — which is itself a simulated form, kept for completeness — or through the channel from which you received a link to the project.",
            "If you believe the demonstration infringes your rights, or that it has been presented to you as a real gambling service, please get in touch so that it can be corrected or taken down.",
          ],
        },
      ],
    },
    {
      slug: "privacy",
      title: "Privacy Notice",
      updated: "July 2026",
      intro:
        "This notice explains how a non-commercial portfolio demonstration handles data. CryptoCasino (this demo) is not a gambling operator: it holds no licence, accepts no deposits, processes no payments, offers no real-money play, and has no server that could receive your information.",
      sections: [
        {
          heading: "Demonstration project",
          paragraphs: [
            "This site exists to demonstrate interface design. It is a static front end: there is no back end, no database, no user account system and no payment processing behind it.",
            "Because nothing is transmitted to the project, most of what a real operator's privacy policy has to describe simply does not happen here. This notice is written to say so plainly, rather than to imply that data is being handled somewhere out of sight.",
          ],
        },
        {
          heading: "Scope of this notice",
          paragraphs: [
            "This notice covers the demonstration site itself. It does not cover the hosting provider that serves the files, which may keep its own standard server logs, nor any external site you reach by following a link.",
            "It also does not cover real gambling operators. If you go on to use one, its own privacy policy governs what it collects about you, and that will be far more extensive than anything described here.",
          ],
        },
        {
          heading: "What the demo stores",
          paragraphs: [
            "Your demo profile, simulated balance, bet history, chosen language, theme, sound preference and interface settings are written to localStorage in the browser you are using. That data stays on your device, is readable only by this site in that browser, and is never sent to the project.",
            "Nothing is synchronised between devices or browsers. Open the demo somewhere else and you will start from a blank state; there is no account to sign back into.",
          ],
        },
        {
          heading: "What is not collected",
          paragraphs: [
            "No identity documents are collected. The verification screens accept nothing, upload nothing and store nothing: a file you attempt to submit is not read, kept or transmitted.",
            "No payment data is collected. There is no card processing, no payment provider, no custody of cryptocurrency and no wallet integration; the deposit and withdrawal screens are visual mock-ups.",
            "No email address, phone number, postal address or government identifier is required, requested for a genuine purpose, or retained by the project. Please do not enter real ones.",
          ],
        },
        {
          heading: "Cookies and local storage",
          paragraphs: [
            "The demo sets no advertising or tracking cookies. Where a cookie is used at all it is strictly functional — for example, remembering the language prefix in the address bar.",
            "The main storage mechanism is localStorage, described above. Unlike a cookie, it is not attached to network requests and is not sent to any server.",
          ],
        },
        {
          heading: "No analytics or third-party trackers",
          paragraphs: [
            "There is no analytics account behind this demonstration: no page-view tracking, no session recording, no heatmaps, no advertising pixels and no social media widgets.",
            "No personal data is sold, shared, profiled or used for advertising, because none is received in the first place.",
          ],
        },
        {
          heading: "Erasing your data",
          paragraphs: [
            "You are in full control. Clearing site data for this domain in your browser settings, or browsing in a private window, removes the demo profile, balance and history immediately and permanently.",
            "In most browsers this sits under the privacy and site-data settings; you can also remove storage for a single site from the padlock or information icon in the address bar.",
            "Because the project holds nothing, there is no separate deletion request to make and no copy retained elsewhere.",
          ],
        },
        {
          heading: "Children",
          paragraphs: [
            "The demonstration presents gambling-themed content and is not intended for anyone under 18, or under the higher minimum age that applies where they live.",
            "It does not knowingly collect anything from children — it does not collect anything from anyone. Adults sharing a device should use parental controls to restrict access.",
          ],
        },
        {
          heading: "Changes to this notice",
          paragraphs: [
            "This notice may be updated as the demonstration changes. The month shown at the top of the page indicates the latest revision, and the current version applies from the moment it is published.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "Questions about how the demonstration handles data can be raised through the contact form in the help section, which is itself simulated, or through the channel from which you received a link to the project.",
            "If you have already entered real personal information into the demo, clear the site data in your browser: that removes it completely, because it was never stored anywhere else.",
          ],
        },
      ],
    },
    {
      slug: "responsible-gambling",
      title: "Responsible Gambling",
      updated: "July 2026",
      intro:
        "CryptoCasino (this demo) is a non-commercial portfolio demonstration with no gambling licence, no deposits, no payments and no real-money play. The guidance below is included because it genuinely matters to anyone who gambles for real money anywhere.",
      sections: [
        {
          heading: "Demonstration project",
          paragraphs: [
            "Nothing on this site can be gambled with. Balances are fictional, money cannot be deposited or withdrawn, and no wager is real.",
            "The page is nevertheless written seriously. A responsible-gambling section is a core part of any real operator's site, and the advice here is the advice that matters if you gamble elsewhere.",
            "The project cannot monitor your play, cannot detect harm and cannot intervene. Please do not treat a simulated safeguard as protection.",
          ],
        },
        {
          heading: "Gambling is entertainment, not a source of income",
          paragraphs: [
            "Every commercial gambling product is built with a mathematical advantage in favour of the operator. Over enough bets the expected result for the player is a loss; that is how the industry funds itself. No system, staking pattern or run of luck changes it.",
            "The healthy way to think about a stake is as the price of an evening's entertainment, like a cinema ticket: money you have already decided you can afford to lose and will not miss.",
            "If you are gambling to make money, to recover a previous loss, or to pay a bill, the activity has stopped being entertainment and the risk to you is high.",
          ],
        },
        {
          heading: "Age restriction",
          paragraphs: [
            "Gambling is for adults only — 18 in most countries, higher in some. Underage gambling is illegal and is strongly associated with problems later in life.",
            "If you share a device with a young person, block gambling content using the parental controls in your operating system, browser or router, and never leave a gambling account signed in.",
          ],
        },
        {
          heading: "Warning signs of problem gambling",
          paragraphs: [
            "Gambling harm develops gradually, and the earliest signs are usually behavioural rather than financial. Common ones include spending more time or money than intended, chasing losses with larger stakes, gambling to escape stress, loneliness or low mood, and feeling restless or irritable when trying to cut down.",
            "Others are social: hiding how much you gamble, lying about it, borrowing money or selling possessions to fund it, missing work, study or family commitments, and neglecting sleep or health.",
            "Financial signals include gambling on credit or with borrowed money, using funds set aside for rent, food or bills, and being unable to say how much you have lost over the past month.",
            "One sign on its own is not a diagnosis. A pattern of several of them, or the sense that gambling is no longer a free choice, is a good reason to seek advice.",
          ],
        },
        {
          heading: "Questions worth asking yourself honestly",
          paragraphs: [
            "Do you gamble for longer than you planned? Have you tried to stop or cut down and found that you could not? Do you return the next day to win back what you lost? Have you been untruthful with anyone about the extent of your gambling?",
            "Do you feel guilty after playing? Has gambling caused an argument, damaged a relationship, or affected your work or study? Have you gambled money that was needed for something else? Have you thought of gambling as a way out of financial trouble?",
            "Answering yes to several of these does not label you, but it does suggest that speaking to a professional service would be worthwhile. Formal screening questionnaires exist and are used by clinicians and helplines; a conversation with one of them is more useful than self-diagnosis.",
          ],
        },
        {
          heading: "Habits that reduce risk",
          paragraphs: [
            "Decide a budget and a time limit before you start, not during play. Treat the budget as spent the moment you begin. Never increase a stake to recover a loss.",
            "Keep gambling away from alcohol, away from times when you are upset or bored, and away from borrowed money. Take frequent breaks, and keep activities in your week that have nothing to do with gambling.",
            "Check your actual spending regularly instead of relying on memory: people consistently remember wins more clearly than losses.",
          ],
        },
        {
          heading: "Tools that licensed operators provide",
          paragraphs: [
            "Regulated operators are generally required to offer player-protection controls: deposit, loss and stake limits; session time limits and reality-check reminders; cooling-off periods and short time-outs; and self-exclusion, which closes access for a fixed period or permanently.",
            "Many jurisdictions also run a multi-operator self-exclusion scheme that blocks accounts across every licensed site at once, and independent blocking software can filter gambling sites on your devices. Banks in some countries offer a gambling transaction block on your card.",
            "These controls work best when they are set in advance, while you are calm, and set tighter than you think you need.",
          ],
        },
        {
          heading: "The controls in this demonstration are simulated",
          paragraphs: [
            "The limits, time-outs, self-exclusion switches and reality checks in this interface are user-interface demonstrations. They change a value stored in your own browser and nothing more.",
            "They enforce nothing, are reported nowhere, cannot be verified, and must never be relied on as a safeguard. If you need genuine protection, set it with the operator you actually use, or through a national self-exclusion scheme.",
          ],
        },
        {
          heading: "Where to seek help",
          paragraphs: [
            "Help is free, confidential and available in most countries. National problem-gambling helplines and organisations in your country offer telephone and online counselling, self-help resources and referral to treatment, and many of them also support family members. Look up the service operating in your country, or ask a doctor or a licensed operator for the current details.",
            "No helpline number or organisation name is printed here, deliberately: contact details differ by country and change over time, and a wrong number in a demonstration project would be worse than none at all. Licensed operators and national regulators publish the correct ones.",
            "If someone close to you is affected, the same services usually advise families too, including practical help with debt and with protecting shared finances. If there is any risk to a person's safety, contact local emergency services.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "Comments on this demonstration can be sent through the contact form in the help section, which is itself simulated. For gambling-related support, please use a real service in your country rather than this project.",
          ],
        },
      ],
    },
    {
      slug: "aml",
      title: "Anti-Money Laundering (AML/KYC)",
      updated: "July 2026",
      intro:
        "CryptoCasino (this demo) is a non-commercial portfolio demonstration: no gambling licence, no deposits, no payments, no real-money play — and consequently no anti-money-laundering programme. This page explains what such a programme involves at a real operator and states plainly that none of it happens here.",
      sections: [
        {
          heading: "Demonstration project",
          paragraphs: [
            "This site is a front-end portfolio piece. It does not receive, hold, convert or transfer funds of any kind, so there is nothing here that could be laundered and no obligation on the project to prevent it.",
            "No regulator supervises the demonstration, no licence underpins it, and no compliance function sits behind it. The material below is descriptive background about the real industry, not a description of controls operated by this project.",
          ],
        },
        {
          heading: "No verification is performed here",
          paragraphs: [
            "This demonstration performs no verification whatsoever. The KYC and verification screens are non-functional placeholders: nothing you type is validated, nothing you upload is received, no document is read, no check is run against any database, and no verification status is real.",
            "A verified badge in this interface is a piece of styling. It proves nothing and means nothing.",
            "For that reason, do not upload a real passport, identity card, driving licence, selfie, utility bill, bank statement or any other genuine document. Use obviously fictional placeholder values.",
          ],
        },
        {
          heading: "What AML, CTF and KYC mean",
          paragraphs: [
            "Anti-money laundering (AML) is the body of law, controls and procedures intended to stop criminal proceeds being passed through a legitimate business until they appear lawful. Counter-terrorist financing (CTF) addresses the related problem of value being moved to finance terrorism, regardless of whether its origin was criminal.",
            "Know Your Customer (KYC) — more precisely, customer due diligence — is the part of that framework concerned with establishing who a customer is, understanding the purpose of the relationship, and keeping that understanding current.",
          ],
        },
        {
          heading: "Why licensed operators do it",
          paragraphs: [
            "Gambling is a high-volume activity in which value can be converted quickly, which historically made it attractive for laundering. Licensed operators are therefore treated as obliged entities under AML legislation in most jurisdictions.",
            "A real operator must maintain a written AML policy, appoint a responsible compliance officer, apply a risk-based approach that puts more scrutiny on higher-risk customers and products, train its staff, and submit to audit and regulatory inspection. Failures carry fines, additional licence conditions, licence revocation and personal liability for officers.",
            "The same framework serves player-protection purposes: it underpins age verification, enforcement of self-exclusion, and affordability checks.",
          ],
        },
        {
          heading: "What a real operator would collect and verify",
          paragraphs: [
            "Typically: full legal name, date of birth, residential address, nationality and contact details, checked against a government-issued identity document and, where required, a proof of address.",
            "Verification is commonly performed electronically against credit-reference and identity databases, or by document capture with a liveness check confirming that the person presenting the document is actually present. Higher-risk cases attract enhanced due diligence, with additional documents and senior sign-off.",
            "Records are re-checked periodically and refreshed when circumstances change, when a threshold is passed, or when behaviour is inconsistent with the customer profile held.",
          ],
        },
        {
          heading: "Source of funds and source of wealth",
          paragraphs: [
            "Source of funds asks where the specific money being staked came from: a salary payment, a sale, a transfer from a named account. Source of wealth asks the broader question of how the customer's overall assets were accumulated.",
            "Above certain thresholds, or where activity looks disproportionate to the profile held, an operator will request documentary evidence such as payslips, tax returns, bank statements or sale contracts, and may restrict the account until it is provided.",
            "Where cryptocurrency is accepted, operators typically use blockchain analytics to assess the provenance of an incoming address and to identify exposure to mixers, darknet markets, sanctioned entities or known thefts.",
          ],
        },
        {
          heading: "Sanctions and politically exposed persons",
          paragraphs: [
            "Real operators screen customers against international and national sanctions lists at onboarding and continuously thereafter, and must block or freeze relationships that produce a match.",
            "They also identify politically exposed persons, their family members and close associates, whose accounts require enhanced monitoring and senior approval because of the heightened corruption risk associated with public office.",
          ],
        },
        {
          heading: "Monitoring and suspicious activity reporting",
          paragraphs: [
            "Activity is monitored on an ongoing basis against expected behaviour. Patterns that commonly attract scrutiny include deposits far beyond a customer's stated means, minimal play followed by an immediate withdrawal request, structuring of amounts to stay below reporting thresholds, third-party funding, and rapid movement of value through several channels.",
            "Where a suspicion of money laundering or terrorist financing arises, an obliged entity must report it to the competent financial intelligence unit in its jurisdiction. Such reports are confidential, and legislation generally prohibits alerting the customer that a report has been made.",
          ],
        },
        {
          heading: "Record keeping",
          paragraphs: [
            "Customer due diligence records, transaction records and the reasoning behind decisions must be retained for a period fixed by law — commonly five years after the relationship ends — so that an audit trail is available to regulators and law enforcement.",
            "Those records are also personal data and must be handled under applicable data-protection law at the same time, which is why real operators restrict internal access to them and delete them once the retention period expires.",
            "None of this applies to the demonstration, which retains nothing: any values you enter stay in your own browser storage and are erased when you clear site data.",
          ],
        },
        {
          heading: "Changes and contact",
          paragraphs: [
            "This page may be revised as the demonstration develops; the month shown at the top indicates the latest revision.",
            "Questions can be raised through the contact form in the help section, which is itself simulated. For information about a specific real operator's AML obligations, consult that operator's published policy or the relevant national regulator.",
          ],
        },
      ],
    },
  ],
  ru: [
    {
      slug: "terms",
      title: "Пользовательское соглашение",
      updated: "Июль 2026",
      intro:
        "CryptoCasino (эта демоверсия) — некоммерческий портфолио-проект, демонстрирующий интерфейс казино. Проект не имеет игорной лицензии, не принимает депозиты, не проводит платежи и не предоставляет игру на реальные деньги; всё, что отображается на экране, является имитацией.",
      sections: [
        {
          heading: "Демонстрационный проект",
          paragraphs: [
            "Этот сайт создан как работа для портфолио и служит демонстрацией навыков проектирования и разработки интерфейсов. Он не управляется игорной компанией, не подключён ни к одной игровой платформе, и ни одна его часть не позволяет сделать реальную ставку.",
            "У проекта нет лицензии, за интерфейсом не стоит регулируемый оператор, и никакая коммерческая деятельность не ведётся. Внести депозит невозможно, запросить вывод средств невозможно, и проект никогда не получает, не хранит и не переводит денежные средства — ни в криптовалюте, ни в какой-либо иной форме.",
            "Адреса кошельков, истории транзакций, бонусы, турниры и экраны верификации представляют собой наглядные макеты. Перевод криптовалюты на любой адрес, отображаемый в демоверсии, приведёт к безвозвратной потере средств, ответственности за которую проект не несёт.",
          ],
        },
        {
          heading: "Предмет соглашения и его принятие",
          paragraphs: [
            "Настоящее соглашение определяет условия, на которых демонстрация предоставляется вам для ознакомления. Просматривая сайт или создавая демонстрационный аккаунт, вы принимаете эти условия. Если вы с ними не согласны, прекратите использование сайта.",
            "Соглашение распространяется на сам интерфейс и на смоделированные в нём функции. Оно не порождает отношений с клиентом, игрового договора и каких-либо прав на выигрыш, выплату или возврат средств, поскольку никакие ценности здесь не участвуют.",
          ],
        },
        {
          heading: "Возрастные ограничения и допуск",
          paragraphs: [
            "Демонстрация содержит материалы игорной тематики и предназначена для совершеннолетних лиц от 18 лет либо от более высокого возраста, установленного законодательством вашей страны. Просим не пользоваться сайтом, если вы младше этого возраста.",
            "Поскольку проект не проводит проверку личности, соблюдение этого ограничения полностью зависит от вас. Взрослым, использующим устройство совместно с несовершеннолетними, следует ограничить доступ средствами родительского контроля операционной системы или браузера.",
            "Вы самостоятельно отвечаете за законность просмотра материалов игорной тематики по месту вашего нахождения. Проект не утверждает, что его содержание допустимо или доступно во всех юрисдикциях.",
          ],
        },
        {
          heading: "Демонстрационные аккаунты",
          paragraphs: [
            "Процессы регистрации и входа смоделированы. Созданный вами аккаунт существует исключительно в хранилище используемого браузера: он никуда не передаётся, не подлежит восстановлению и исчезнет при очистке данных сайта или переходе на другое устройство.",
            "Просим не вводить в поля форм настоящие персональные данные, изображения подлинных документов, пароли, используемые в других сервисах, и ключи от криптокошельков. Используйте вымышленные значения.",
            "Проект вправе в любой момент и без предварительного уведомления изменить, сбросить или удалить демонстрационные функции и не может восстановить утраченный аккаунт, баланс или историю.",
          ],
        },
        {
          heading: "Виртуальные балансы",
          paragraphs: [
            "Все балансы, ставки, выигрыши, бонусы, кэшбэк, баллы лояльности и турнирные призы в демоверсии представляют собой вымышленные значения, формируемые интерфейсом локально. Они не имеют денежной стоимости, не подлежат обмену, продаже, передаче или выводу и не предоставляют никаких прав.",
            "Исходы игр определяются псевдослучайным генератором, работающим в вашем браузере исключительно в наглядных целях. Показатели отдачи, коэффициенты и экраны проверки честности носят оформительский характер и не являются утверждениями о каком-либо реальном продукте.",
          ],
        },
        {
          heading: "Допустимое использование",
          paragraphs: [
            "Вы вправе просматривать демонстрацию, взаимодействовать с её смоделированными функциями и изучать её в ознакомительных или оценочных целях.",
            "Запрещается выдавать сайт за действующий игорный сервис, использовать его для получения от третьих лиц денежных средств или персональных данных, заявлять о связи с лицензированным оператором, а также использовать его название, снимки экрана или исходный код для придания видимости легитимности мошеннической схеме.",
            "Запрещается нарушать работу сайта, внедрять вредоносный код, осуществлять автоматизированный сбор данных в объёме, ухудшающем работу сайта для других посетителей, а также обходить технические ограничения.",
          ],
        },
        {
          heading: "Интеллектуальная собственность",
          paragraphs: [
            "Интерфейс, компоновка, библиотека компонентов, иллюстрации, тексты и исходный код демонстрации являются самостоятельной работой автора и остаются его собственностью.",
            "Материалы сторонних правообладателей не используются: в проекте нет лицензионных игровых автоматов, ресурсов игровых студий, программного обеспечения провайдеров и брендинга операторов. Все названия игр и провайдеров, логотипы, турниры и акции вымышлены для целей демонстрации, а любое сходство с реальными продуктами или брендами является непреднамеренным.",
            "Сторонние библиотеки с открытым исходным кодом, использованные при разработке, распространяются на условиях собственных лицензий.",
          ],
        },
        {
          heading: "Отказ от гарантий и ограничение ответственности",
          paragraphs: [
            "Демонстрация предоставляется на условиях «как есть» и «по мере доступности», без каких-либо гарантий. Проект не гарантирует точность, бесперебойность, безошибочность и защищённость работы сайта, а также сохранность локально сохранённых демонстрационных данных.",
            "Никакие материалы сайта не являются финансовой, юридической, налоговой или игровой консультацией. Любые решения, связанные с реальными азартными играми или реальной криптовалютой, вы принимаете исключительно самостоятельно.",
            "В максимальной степени, допускаемой законом, автор не несёт ответственности за убытки и ущерб, возникшие вследствие использования демонстрации или доверия к ней, включая утрату данных, потерю криптовалюты, отправленной на отображаемые адреса, и потери, понесённые в реальных игорных сервисах. Настоящее положение не ограничивает ответственность, которая не может быть ограничена по закону.",
          ],
        },
        {
          heading: "Изменение условий",
          paragraphs: [
            "По мере развития проекта настоящие условия могут обновляться. Изменённая редакция действует с момента её публикации на этой странице, а указанный вверху месяц отражает дату последнего изменения.",
            "Продолжение использования демонстрации после внесения изменений означает согласие с обновлённой редакцией.",
          ],
        },
        {
          heading: "Контакты",
          paragraphs: [
            "Вопросы о демонстрации, её содержании и условиях использования можно направить через форму обратной связи в разделе помощи — которая сама является смоделированной и сохранена для полноты картины, — либо по тому каналу, по которому вы получили ссылку на проект.",
            "Если вы считаете, что демонстрация нарушает ваши права или была представлена вам как действующий игорный сервис, сообщите об этом, чтобы материал можно было исправить или удалить.",
          ],
        },
      ],
    },
    {
      slug: "privacy",
      title: "Политика конфиденциальности",
      updated: "Июль 2026",
      intro:
        "Настоящий документ описывает обращение с данными в некоммерческом портфолио-проекте. CryptoCasino (эта демоверсия) не является игорным оператором: у проекта нет лицензии, он не принимает депозиты, не проводит платежи и не предоставляет игру на реальные деньги, а также не имеет сервера, способного получить ваши данные.",
      sections: [
        {
          heading: "Демонстрационный проект",
          paragraphs: [
            "Сайт создан для демонстрации проектирования интерфейсов. Это статическое клиентское приложение: за ним нет серверной части, базы данных, системы учётных записей и обработки платежей.",
            "Поскольку проекту ничего не передаётся, большая часть того, что обязана описывать политика конфиденциальности реального оператора, здесь попросту отсутствует. Этот документ составлен, чтобы прямо об этом заявить, а не чтобы создать впечатление скрытой обработки данных.",
          ],
        },
        {
          heading: "Сфера действия документа",
          paragraphs: [
            "Документ распространяется на сам демонстрационный сайт. Он не распространяется на хостинг-провайдера, обслуживающего файлы сайта и способного вести собственные стандартные журналы обращений, а также на внешние ресурсы, на которые вы можете перейти по ссылкам.",
            "Он также не распространяется на реальных игорных операторов. Если вы воспользуетесь услугами такого оператора, обработка ваших данных будет регулироваться его собственной политикой и окажется значительно более обширной, чем описанное здесь.",
          ],
        },
        {
          heading: "Какие данные хранит демоверсия",
          paragraphs: [
            "Демонстрационный профиль, условный баланс, история ставок, выбранный язык, оформление, настройки звука и параметры интерфейса записываются в localStorage используемого вами браузера. Эти данные остаются на вашем устройстве, доступны только этому сайту в этом браузере и никогда не передаются проекту.",
            "Синхронизация между устройствами и браузерами отсутствует. Открыв демоверсию в другом месте, вы начнёте с чистого состояния: аккаунта, в который можно войти повторно, не существует.",
          ],
        },
        {
          heading: "Какие данные не собираются",
          paragraphs: [
            "Документы, удостоверяющие личность, не собираются. Экраны верификации ничего не принимают, не загружают и не сохраняют: файл, который вы попытаетесь отправить, не будет прочитан, сохранён или передан.",
            "Платёжные данные не собираются. Обработка карт, платёжные провайдеры, хранение криптовалюты и интеграция с кошельками отсутствуют; экраны пополнения и вывода представляют собой визуальные макеты.",
            "Адрес электронной почты, номер телефона, почтовый адрес и государственные идентификаторы не требуются, не запрашиваются для реальных целей и не сохраняются проектом. Просим не вводить настоящие данные.",
          ],
        },
        {
          heading: "Файлы cookie и локальное хранилище",
          paragraphs: [
            "Демоверсия не использует рекламные и отслеживающие файлы cookie. Если файл cookie и применяется, то исключительно в функциональных целях — например, для запоминания языкового префикса в адресной строке.",
            "Основным механизмом хранения является localStorage, описанный выше. В отличие от cookie, он не прикрепляется к сетевым запросам и не передаётся ни на какой сервер.",
          ],
        },
        {
          heading: "Отсутствие аналитики и сторонних трекеров",
          paragraphs: [
            "За демонстрацией не стоит ни одна система аналитики: не ведётся учёт просмотров страниц, не записываются сессии, не строятся тепловые карты, не используются рекламные пиксели и виджеты социальных сетей.",
            "Персональные данные не продаются, не передаются третьим лицам, не используются для профилирования и рекламы, поскольку проект их вовсе не получает.",
          ],
        },
        {
          heading: "Как удалить данные",
          paragraphs: [
            "Контроль полностью на вашей стороне. Очистка данных сайта для этого домена в настройках браузера или использование режима приватного просмотра немедленно и безвозвратно удаляет демонстрационный профиль, баланс и историю.",
            "В большинстве браузеров этот пункт находится в разделе настроек конфиденциальности и данных сайтов; удалить хранилище отдельного сайта также можно через значок замка или сведений о сайте в адресной строке.",
            "Поскольку проект ничего не хранит, отдельный запрос на удаление направлять не требуется, и никаких копий в других местах не остаётся.",
          ],
        },
        {
          heading: "Несовершеннолетние",
          paragraphs: [
            "Демонстрация содержит материалы игорной тематики и не предназначена для лиц младше 18 лет либо младше более высокого возраста, установленного законодательством их страны.",
            "Проект заведомо не собирает данные несовершеннолетних — как и данные кого бы то ни было. Взрослым, использующим устройство совместно с детьми, рекомендуется ограничить доступ средствами родительского контроля.",
          ],
        },
        {
          heading: "Изменение документа",
          paragraphs: [
            "Настоящий документ может обновляться по мере развития демонстрации. Указанный вверху страницы месяц отражает дату последней редакции, а действующая редакция применяется с момента её публикации.",
          ],
        },
        {
          heading: "Контакты",
          paragraphs: [
            "Вопросы об обращении с данными в демонстрации можно направить через форму обратной связи в разделе помощи, которая сама является смоделированной, либо по тому каналу, по которому вы получили ссылку на проект.",
            "Если вы всё же ввели в демоверсию настоящие персональные данные, очистите данные сайта в браузере: это полностью их удалит, поскольку больше они нигде не хранились.",
          ],
        },
      ],
    },
    {
      slug: "responsible-gambling",
      title: "Ответственная игра",
      updated: "Июль 2026",
      intro:
        "CryptoCasino (эта демоверсия) — некоммерческий портфолио-проект без игорной лицензии, без депозитов, без платежей и без игры на реальные деньги. Приведённые ниже материалы включены потому, что они действительно важны для каждого, кто играет на реальные деньги где бы то ни было.",
      sections: [
        {
          heading: "Демонстрационный проект",
          paragraphs: [
            "Ни на что на этом сайте нельзя сделать ставку. Балансы вымышлены, внести или вывести деньги невозможно, и ни одна ставка не является реальной.",
            "Тем не менее эта страница написана всерьёз. Раздел об ответственной игре — обязательная часть сайта любого реального оператора, и изложенные здесь рекомендации имеют значение, если вы играете где-либо ещё.",
            "Проект не может отслеживать вашу игру, выявлять признаки зависимости и вмешиваться. Не воспринимайте смоделированные механизмы защиты как реальную защиту.",
          ],
        },
        {
          heading: "Игра — это развлечение, а не источник дохода",
          paragraphs: [
            "Любой коммерческий игорный продукт устроен так, что математическое преимущество принадлежит оператору. На достаточно длинной дистанции ожидаемый результат для игрока отрицателен — именно за счёт этого существует отрасль. Ни одна система, схема ставок или полоса везения этого не меняет.",
            "Здравое отношение к ставке — считать её платой за вечер развлечения, как за билет в кино: это деньги, которые вы заранее готовы потерять и отсутствия которых не заметите.",
            "Если вы играете, чтобы заработать, отыграть предыдущий проигрыш или оплатить счёт, игра перестала быть развлечением, и риск для вас высок.",
          ],
        },
        {
          heading: "Возрастные ограничения",
          paragraphs: [
            "Азартные игры доступны только совершеннолетним: в большинстве стран — с 18 лет, в некоторых порог выше. Игра несовершеннолетних незаконна и тесно связана с проблемами в дальнейшей жизни.",
            "Если вы пользуетесь устройством совместно с подростком, заблокируйте материалы игорной тематики средствами родительского контроля операционной системы, браузера или маршрутизатора и никогда не оставляйте игровой аккаунт открытым.",
          ],
        },
        {
          heading: "Признаки игровой зависимости",
          paragraphs: [
            "Игровая зависимость развивается постепенно, и её ранние признаки чаще поведенческие, чем финансовые. К типичным относятся: игра дольше и на большие суммы, чем планировалось; попытки отыграться повышением ставок; игра ради ухода от стресса, одиночества или подавленного настроения; раздражительность и беспокойство при попытках сократить игру.",
            "Другие признаки социальные: сокрытие масштабов игры, ложь о ней, займы или продажа вещей ради игры, пропуск работы, учёбы и семейных обязанностей, пренебрежение сном и здоровьем.",
            "К финансовым сигналам относятся игра в кредит или на заёмные средства, использование денег, отложенных на жильё, питание и счета, а также неспособность назвать сумму проигрыша за последний месяц.",
            "Отдельный признак сам по себе не является диагнозом. Сочетание нескольких из них или ощущение, что игра перестала быть свободным выбором, — веский повод обратиться за консультацией.",
          ],
        },
        {
          heading: "Вопросы для честной самопроверки",
          paragraphs: [
            "Играете ли вы дольше, чем собирались? Пытались ли вы прекратить или сократить игру и не смогли? Возвращаетесь ли вы на следующий день, чтобы отыграть проигранное? Говорили ли вы кому-либо неправду о масштабах своей игры?",
            "Испытываете ли вы чувство вины после игры? Приводила ли игра к ссорам, портила ли отношения, сказывалась ли на работе или учёбе? Играли ли вы на деньги, предназначенные для других целей? Рассматривали ли вы игру как способ решить финансовые трудности?",
            "Несколько утвердительных ответов не ставят на вас клеймо, но указывают на то, что имеет смысл обратиться в профессиональную службу. Существуют формальные опросники, применяемые специалистами и службами помощи; беседа со специалистом полезнее самостоятельной постановки диагноза.",
          ],
        },
        {
          heading: "Привычки, снижающие риск",
          paragraphs: [
            "Определяйте бюджет и лимит времени до начала игры, а не в процессе. Считайте бюджет потраченным в момент старта. Никогда не повышайте ставку ради возврата проигранного.",
            "Не совмещайте игру с алкоголем, не играйте в подавленном состоянии или от скуки и не играйте на заёмные деньги. Делайте частые перерывы и сохраняйте в своём расписании занятия, никак не связанные с игрой.",
            "Регулярно проверяйте фактические расходы, а не полагайтесь на память: выигрыши запоминаются людьми заметно лучше проигрышей.",
          ],
        },
        {
          heading: "Инструменты защиты у лицензированных операторов",
          paragraphs: [
            "Регулируемые операторы, как правило, обязаны предоставлять инструменты защиты игрока: лимиты депозита, проигрыша и ставки; ограничение длительности сессии и напоминания о времени игры; периоды охлаждения и краткие перерывы; самоисключение, закрывающее доступ на определённый срок или бессрочно.",
            "Во многих юрисдикциях действует единая система самоисключения, блокирующая аккаунты сразу у всех лицензированных операторов, а независимые программы блокировки позволяют фильтровать игорные сайты на ваших устройствах. Банки в ряде стран предлагают блокировку игорных операций по карте.",
            "Эти инструменты работают лучше всего, когда установлены заранее, в спокойном состоянии, и заданы строже, чем кажется необходимым.",
          ],
        },
        {
          heading: "Механизмы защиты в этой демоверсии смоделированы",
          paragraphs: [
            "Лимиты, перерывы, переключатели самоисключения и напоминания о времени в этом интерфейсе являются демонстрацией пользовательского интерфейса. Они изменяют лишь значение, сохранённое в вашем собственном браузере.",
            "Они ничего не ограничивают, никуда не передаются, не поддаются проверке и ни в коем случае не должны рассматриваться как средство защиты. Если вам нужна настоящая защита, установите её у оператора, услугами которого вы пользуетесь, или через национальную систему самоисключения.",
          ],
        },
        {
          heading: "Куда обратиться за помощью",
          paragraphs: [
            "Помощь бесплатна, конфиденциальна и доступна в большинстве стран. Национальные линии помощи и организации по проблемам игровой зависимости в вашей стране предоставляют консультации по телефону и онлайн, материалы для самопомощи и направление на лечение, а многие из них работают и с родственниками. Найдите службу, действующую в вашей стране, либо запросите актуальные контакты у врача или лицензированного оператора.",
            "Ни один номер телефона доверия и ни одно название организации здесь намеренно не приводятся: контактные данные различаются по странам и со временем меняются, а неверный номер в демонстрационном проекте был бы хуже его отсутствия. Корректные контакты публикуют лицензированные операторы и национальные регуляторы.",
            "Если проблема затрагивает близкого вам человека, те же службы обычно консультируют и семьи, включая практическую помощь с долгами и защитой общих финансов. При наличии угрозы жизни или здоровью обращайтесь в экстренные службы.",
          ],
        },
        {
          heading: "Обратная связь",
          paragraphs: [
            "Замечания по демонстрации можно направить через форму обратной связи в разделе помощи, которая сама является смоделированной. За поддержкой по вопросам игровой зависимости обращайтесь в реальные службы в вашей стране, а не к этому проекту.",
          ],
        },
      ],
    },
    {
      slug: "aml",
      title: "Противодействие отмыванию денег (AML/KYC)",
      updated: "Июль 2026",
      intro:
        "CryptoCasino (эта демоверсия) — некоммерческий портфолио-проект: без игорной лицензии, без депозитов, без платежей и без игры на реальные деньги, а следовательно, и без программы противодействия отмыванию денег. Эта страница поясняет, что такая программа представляет собой у реального оператора, и прямо заявляет, что здесь ничего из перечисленного не происходит.",
      sections: [
        {
          heading: "Демонстрационный проект",
          paragraphs: [
            "Сайт представляет собой клиентскую работу для портфолио. Он не получает, не хранит, не конвертирует и не переводит денежные средства в какой бы то ни было форме, поэтому здесь нечего отмывать и у проекта нет обязанности этому препятствовать.",
            "Демонстрация не поднадзорна какому-либо регулятору, не опирается на лицензию, и за ней не стоит функция комплаенса. Изложенное ниже — описательная справка об отрасли, а не описание мер, применяемых этим проектом.",
          ],
        },
        {
          heading: "Никакая проверка здесь не проводится",
          paragraphs: [
            "Демонстрация не выполняет никаких проверок. Экраны KYC и верификации являются нефункциональными заглушками: вводимые данные не проверяются, загружаемые файлы не принимаются, документы не читаются, обращения к каким-либо базам данных не выполняются, а статус верификации не является настоящим.",
            "Отметка о пройденной верификации в этом интерфейсе — элемент оформления. Она ничего не подтверждает и ничего не означает.",
            "По этой причине не загружайте настоящие паспорт, удостоверение личности, водительское удостоверение, селфи, счета за коммунальные услуги, банковские выписки и любые иные подлинные документы. Используйте заведомо вымышленные значения.",
          ],
        },
        {
          heading: "Что означают AML, CTF и KYC",
          paragraphs: [
            "Противодействие отмыванию денег (AML) — совокупность законодательных требований, мер контроля и процедур, призванных не допустить, чтобы преступные доходы проходили через законный бизнес и приобретали видимость легального происхождения. Противодействие финансированию терроризма (CTF) решает смежную задачу: пресечение движения средств на цели терроризма независимо от законности их источника.",
            "Знай своего клиента (KYC), точнее — надлежащая проверка клиента, представляет собой ту часть этой системы, которая отвечает за установление личности клиента, понимание целей деловых отношений и поддержание этих сведений в актуальном состоянии.",
          ],
        },
        {
          heading: "Почему лицензированные операторы это делают",
          paragraphs: [
            "Азартные игры связаны с высоким оборотом и быстрой конвертацией стоимости, что исторически делало их привлекательными для отмывания средств. Поэтому в большинстве юрисдикций лицензированные операторы отнесены к субъектам, на которых распространяются обязанности по законодательству о противодействии отмыванию денег.",
            "Реальный оператор обязан иметь письменную AML-политику, назначить ответственное лицо по комплаенсу, применять риск-ориентированный подход с усиленным вниманием к клиентам и продуктам повышенного риска, обучать персонал и проходить аудит и проверки регулятора. Нарушения влекут штрафы, дополнительные лицензионные условия, отзыв лицензии и персональную ответственность руководителей.",
            "Та же система решает и задачи защиты игроков: на ней основаны проверка возраста, соблюдение самоисключения и оценка платёжеспособности.",
          ],
        },
        {
          heading: "Какие сведения собирал и проверял бы реальный оператор",
          paragraphs: [
            "Как правило: полное имя, дату рождения, адрес проживания, гражданство и контактные данные — с последующей сверкой с документом, удостоверяющим личность, и, при необходимости, с подтверждением адреса.",
            "Проверка обычно выполняется электронно по базам кредитных бюро и идентификационным реестрам либо путём фотофиксации документа с подтверждением присутствия живого человека. В случаях повышенного риска применяются углублённые меры проверки с запросом дополнительных документов и утверждением на уровне руководства.",
            "Сведения периодически перепроверяются и обновляются при изменении обстоятельств, достижении пороговых значений или при поведении, не соответствующем имеющемуся профилю клиента.",
          ],
        },
        {
          heading: "Источник средств и источник благосостояния",
          paragraphs: [
            "Источник средств отвечает на вопрос, откуда получены конкретные деньги, используемые для ставок: заработная плата, продажа имущества, перевод с определённого счёта. Источник благосостояния касается более широкого вопроса — как в целом сформированы активы клиента.",
            "При превышении определённых порогов или при активности, несоразмерной известному профилю клиента, оператор запрашивает документальные подтверждения — расчётные листки, налоговые декларации, банковские выписки, договоры купли-продажи — и вправе ограничить операции по счёту до их предоставления.",
            "Там, где принимается криптовалюта, операторы обычно используют блокчейн-аналитику для оценки происхождения входящего адреса и выявления связей с миксерами, теневыми площадками, подсанкционными лицами и известными хищениями.",
          ],
        },
        {
          heading: "Санкционные списки и публичные должностные лица",
          paragraphs: [
            "Реальные операторы проверяют клиентов по международным и национальным санкционным спискам при открытии счёта и на постоянной основе впоследствии, а при совпадении обязаны заблокировать отношения или заморозить активы.",
            "Они также выявляют публичных должностных лиц, членов их семей и близких связанных лиц: такие счета требуют усиленного мониторинга и одобрения на уровне руководства ввиду повышенного коррупционного риска, связанного с публичными должностями.",
          ],
        },
        {
          heading: "Мониторинг и сообщения о подозрительных операциях",
          paragraphs: [
            "Активность постоянно сопоставляется с ожидаемым поведением клиента. Внимание обычно привлекают: пополнения, значительно превышающие заявленные возможности клиента; минимальная игра с немедленным запросом вывода; дробление сумм для удержания их ниже пороговых значений; финансирование третьими лицами; быстрое перемещение средств по нескольким каналам.",
            "При возникновении подозрений в отмывании денег или финансировании терроризма обязанное лицо направляет сообщение в компетентное подразделение финансовой разведки своей юрисдикции. Такие сообщения конфиденциальны, и законодательство, как правило, запрещает информировать клиента об их направлении.",
          ],
        },
        {
          heading: "Хранение документов",
          paragraphs: [
            "Материалы надлежащей проверки клиента, сведения об операциях и обоснования принятых решений подлежат хранению в течение установленного законом срока — обычно пяти лет после прекращения отношений, — чтобы обеспечить аудиторский след для регуляторов и правоохранительных органов.",
            "Эти материалы одновременно являются персональными данными и подлежат обработке в соответствии с законодательством о защите данных, поэтому реальные операторы ограничивают внутренний доступ к ним и удаляют их по истечении срока хранения.",
            "К демонстрации всё это не относится: она не хранит ничего — введённые вами значения остаются в хранилище вашего браузера и удаляются при очистке данных сайта.",
          ],
        },
        {
          heading: "Изменения и контакты",
          paragraphs: [
            "Эта страница может пересматриваться по мере развития демонстрации; указанный вверху месяц отражает дату последней редакции.",
            "Вопросы можно направить через форму обратной связи в разделе помощи, которая сама является смоделированной. За сведениями об AML-обязанностях конкретного реального оператора обращайтесь к его опубликованной политике или к соответствующему национальному регулятору.",
          ],
        },
      ],
    },
  ],
};
