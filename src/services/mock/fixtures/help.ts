/**
 * Help center content and support-bot scripts.
 *
 * Data only: both locales carry the same article slugs in the same order so the
 * UI can switch language without losing the article the user is reading.
 */

export interface HelpArticleFixture {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  body: string[];
}

export const HELP_ARTICLES: Record<"en" | "ru", HelpArticleFixture[]> = {
  en: [
    {
      slug: "how-to-create-account",
      category: "account",
      title: "How to create an account",
      excerpt:
        "Registration takes about a minute: choose an email and a password, confirm your age, and the account is ready.",
      body: [
        "Open the sign-up form from the button in the top right corner of any page. You will be asked for an email address and a password, and there is an optional field for a promo code if you already have one.",
        "Pick a password of at least eight characters that you do not reuse anywhere else. Support staff never ask for your password, neither in chat nor by email, so treat any such request as fraudulent.",
        "Before the account is created you have to confirm that you are of legal age in your country and that you accept the terms of service. One person may hold one account only.",
        "As soon as the form is submitted you are signed in. A confirmation link goes to your email address, and following it unlocks the remaining account features.",
        "If the form reports that the address is already in use, sign in instead or use the password recovery link on the login screen.",
      ],
    },
    {
      slug: "verify-your-email",
      category: "account",
      title: "Verifying your email address",
      excerpt:
        "Confirming your email unlocks the full account, enables notifications, and gives you a reliable way to recover access.",
      body: [
        "After registration a message with a confirmation link is sent to the address you entered. The link stays valid for twenty-four hours and can be used once.",
        "If the message has not arrived within a few minutes, check the spam and promotions folders, then request a new link from the profile page. Each new request invalidates the previous one.",
        "A confirmed address is what lets you reset a forgotten password, receive security alerts about new sign-ins, and switch on email notifications for finished bets and completed transactions.",
        "You can change the address later from account settings. The new address has to be confirmed the same way, and the old one keeps working until it is.",
      ],
    },
    {
      slug: "change-nickname-and-avatar",
      category: "account",
      title: "Changing your nickname and avatar",
      excerpt:
        "Your nickname and avatar are what other players see on leaderboards, and both can be edited from profile settings.",
      body: [
        "Open the profile page and select Edit profile. The nickname field accepts three to sixteen characters: Latin letters, digits, underscores and hyphens.",
        "Nicknames are unique across the platform, so a name already taken by someone else is rejected with a hint. Names that imitate staff accounts or contain offensive language are not accepted either.",
        "The avatar is chosen from the built-in gallery. Pick a tile and save the form; the new picture appears everywhere your profile is shown, including race tables and recent-winner lists.",
        "Changes take effect immediately, and the nickname can be changed again after a short cooldown to keep leaderboards readable.",
      ],
    },
    {
      slug: "close-or-delete-account",
      category: "account",
      title: "Closing or deleting your account",
      excerpt:
        "You can pause the account for a cooling-off period or ask for permanent deletion, both from the account settings page.",
      body: [
        "A self-exclusion break is the reversible option. Choose a period, confirm it, and the account is locked for that time: you cannot sign in, place bets or open games until the period ends.",
        "Permanent deletion is requested from the same screen. It removes your profile, nickname, preferences and history, and it cannot be undone once processed.",
        "Before a deletion request is accepted, any open bets and pending transactions have to be settled or cancelled, so it is worth checking the wallet and bet history first.",
        "If you only want to stop the messages, turning off email and push notifications in settings is usually enough and leaves the account intact.",
      ],
    },
    {
      slug: "how-to-make-a-deposit",
      category: "deposits",
      title: "How to make a deposit",
      excerpt:
        "Choose a coin, choose a network, copy the address shown on screen, and send from your own wallet to top up the balance.",
      body: [
        "Open the wallet and select Deposit. Pick the coin you want to add, then pick the network it will travel on. The screen then shows a deposit address together with a QR code.",
        "Copy the address exactly as displayed, or scan the QR code with your wallet application. Addresses are generated per coin and network, so never reuse an address from a different pair.",
        "Send the amount from your own wallet. Once the network reaches the required number of confirmations, the platform credits your balance and the transaction appears in the wallet history.",
        "Deposits below the published minimum for a coin may not be credited automatically, and each network charges its own transfer fee that is deducted by the network, not by the platform.",
        "This is a demonstration project. Balances, addresses and transactions are simulated, and no real funds are processed.",
      ],
    },
    {
      slug: "choosing-coin-and-network",
      category: "deposits",
      title: "Choosing the right coin and network",
      excerpt:
        "The same coin can exist on several networks, and the network you select has to match the one your sending wallet uses.",
      body: [
        "Stablecoins in particular are issued on more than one chain. The same balance can be moved over TRC20, ERC20 or BEP20, and each of those is a separate network with its own addresses and fees.",
        "Always set the network on the deposit screen first, then compare it with the network your sending wallet or exchange offers. If the two do not match, the transfer will not arrive at the intended address.",
        "Networks differ mainly in cost and speed. TRC20 transfers of stablecoins are usually the cheapest, ERC20 transfers cost the most, and chains such as Solana confirm within seconds.",
        "Transfers sent on a network that is not supported for the selected coin cannot be recovered by the platform, because the funds never reach an address it controls. Double-checking the pair takes a few seconds and prevents that entirely.",
        "This is a demonstration project. Balances, addresses and transactions are simulated, and no real funds are processed.",
      ],
    },
    {
      slug: "minimum-deposit-amounts",
      category: "deposits",
      title: "Minimum deposit amounts",
      excerpt:
        "Every coin has a minimum deposit that covers network handling costs, and smaller transfers may not be credited at all.",
      body: [
        "The minimum is shown on the deposit screen next to the selected coin, and it is quoted in the coin itself rather than in a fiat currency, so it does not move with the exchange rate.",
        "Minimums exist because every incoming transfer has to be swept on-chain, and that sweep costs a network fee. A transfer smaller than the fee would cost more to move than it is worth.",
        "If you send less than the minimum, the amount can stay unprocessed until later transfers to the same address bring the total above the threshold.",
        "Sending one larger transfer instead of several small ones is almost always cheaper, because you pay the network fee once rather than once per transaction.",
        "This is a demonstration project. Balances, addresses and transactions are simulated, and no real funds are processed.",
      ],
    },
    {
      slug: "why-is-my-deposit-delayed",
      category: "deposits",
      title: "Why is my deposit delayed",
      excerpt:
        "Most delays come from pending network confirmations, a low fee on the sending side, or a mismatched network choice.",
      body: [
        "A transfer is only visible once it has been included in a block. Until the sending wallet reports a transaction hash there is nothing for the platform to detect, however long the wallet has been showing it as sent.",
        "Every coin requires a set number of confirmations before the balance is credited. Busy chains and low sending fees both slow that down, and some networks simply take longer by design.",
        "If the transaction is confirmed on the chain but the balance has not moved, the most common cause is a network mismatch: the coin was sent over a chain that the selected deposit address does not serve.",
        "Before contacting support, have the transaction hash, the coin, the network and the amount ready. With the hash the transfer can be traced on a public block explorer in a moment.",
        "This is a demonstration project. Balances, addresses and transactions are simulated, and no real funds are processed.",
      ],
    },
    {
      slug: "how-to-withdraw-funds",
      category: "withdrawals",
      title: "How to withdraw funds",
      excerpt:
        "Open the wallet, choose Withdraw, paste the destination address, select a matching network and confirm the request.",
      body: [
        "Select Withdraw in the wallet and choose the coin. Paste the destination address from your own wallet, then choose the network that address belongs to.",
        "Enter the amount. The screen shows the network fee and the exact figure that will arrive, so you can adjust the amount before confirming rather than being surprised afterwards.",
        "Confirm the request. If two-factor authentication is enabled, a code is requested at this point, which is what stops someone with only your password from moving the balance.",
        "The request then appears in the wallet history with its current status and, once broadcast, a transaction hash you can follow on a public block explorer.",
        "This is a demonstration project. Balances, addresses and transactions are simulated, and no real funds are processed.",
      ],
    },
    {
      slug: "withdrawal-fees-explained",
      category: "withdrawals",
      title: "Withdrawal fees explained",
      excerpt:
        "A withdrawal fee covers the cost of broadcasting your transaction, and it changes with the coin and network you pick.",
      body: [
        "The fee is charged in the coin being withdrawn and is shown on the confirmation screen before you commit to anything.",
        "Most of the fee is what the network itself charges to include a transaction in a block, which is why the same coin can cost very different amounts depending on the chain you route it over.",
        "Because the fee is a flat amount rather than a percentage, one larger withdrawal is more efficient than several small ones. Splitting a payout in four means paying the fee four times.",
        "Any bonus balance still under wagering is excluded from the withdrawable amount, so the maximum the form accepts can be lower than the total balance shown in the wallet.",
        "This is a demonstration project. Balances, addresses and transactions are simulated, and no real funds are processed.",
      ],
    },
    {
      slug: "withdrawal-processing-times",
      category: "withdrawals",
      title: "How long a withdrawal takes",
      excerpt:
        "Requests are reviewed first and then broadcast, so the total time depends on the chain and on the current queue.",
      body: [
        "A withdrawal moves through three stages: an automatic check, the broadcast to the network, and the confirmations the network needs before the receiving wallet treats it as final.",
        "The first stage is usually the quickest and most requests clear it without anyone touching them. Larger amounts and first-time addresses can be routed to a manual review.",
        "Once broadcast, timing is entirely up to the chain. Fast networks settle within seconds, while congested ones can take considerably longer at peak hours.",
        "The wallet history shows the current stage for every request, and the transaction hash appears as soon as the transfer has been broadcast.",
        "This is a demonstration project. Balances, addresses and transactions are simulated, and no real funds are processed.",
      ],
    },
    {
      slug: "why-is-my-withdrawal-pending",
      category: "withdrawals",
      title: "Why is my withdrawal pending",
      excerpt:
        "A pending status usually means a routine review, an unfinished bonus wager, or a destination address awaiting confirmation.",
      body: [
        "Pending simply means the request has been accepted and has not been broadcast yet. Nothing is lost while a request sits in that state, and it can still be cancelled from the wallet history.",
        "The most frequent reason is an active bonus: while a wagering requirement is unfinished, the linked part of the balance stays locked and cannot leave the account.",
        "New destination addresses and unusually large amounts trigger an additional check. Confirming the request from your email, or completing two-factor authentication, clears it faster.",
        "If a request has been pending far longer than the times listed in the processing article, cancel it and submit it again, checking that the address and the network match.",
        "This is a demonstration project. Balances, addresses and transactions are simulated, and no real funds are processed.",
      ],
    },
    {
      slug: "how-to-use-a-promo-code",
      category: "bonuses",
      title: "How to use a promo code",
      excerpt:
        "Promo codes are entered during sign-up or later on the bonuses page, and the reward is applied to the account at once.",
      body: [
        "During registration the sign-up form has an optional promo code field. Codes entered there are applied as soon as the account exists.",
        "For an existing account, open the bonuses page and use the promo code box at the top. Codes are not case sensitive, but stray spaces from copying and pasting will make them fail.",
        "Each code can be redeemed once per account and has its own validity window. Expired or already used codes are rejected with an explanation instead of silently doing nothing.",
        "After a successful redemption the reward appears in the active bonuses list together with its wagering target, its progress bar and the date it expires.",
      ],
    },
    {
      slug: "wagering-requirements-explained",
      category: "bonuses",
      title: "What wagering requirements mean",
      excerpt:
        "A wagering requirement is the total you need to bet before bonus funds turn into a regular, unrestricted balance.",
      body: [
        "Bonuses are credited with a multiplier attached. A bonus with a twenty-five times requirement means the bonus amount has to be wagered twenty-five times over before it converts.",
        "Only settled bets count towards the target. Cancelled bets, voided selections and rounds that end with the stake returned do not move the progress bar.",
        "Different game types can contribute at different rates, and the contribution table is shown on the bonus card so you can see which games move the target fastest.",
        "Progress is visible at any time on the bonuses page. Until the target is reached, the bonus part of the balance stays separate from the rest and cannot be withdrawn.",
      ],
    },
    {
      slug: "bonus-expiry-and-forfeiture",
      category: "bonuses",
      title: "Bonus expiry and forfeiture",
      excerpt:
        "Every bonus has a validity window, and once it closes the remaining bonus amount and its progress are removed automatically.",
      body: [
        "The expiry date is shown on the bonus card from the moment it is credited, and the countdown starts then rather than when you first play.",
        "When a bonus expires, the outstanding bonus amount and any winnings still tied to it are removed. Balance that has already completed its wagering is unaffected.",
        "You can also give up a bonus deliberately. Forfeiting from the bonuses page clears the requirement immediately and unlocks the rest of the balance, at the cost of the bonus itself.",
        "Only one bonus of a given type is active at a time. A new bonus of the same type waits in the queue until the current one is finished, forfeited or expired.",
      ],
    },
    {
      slug: "vip-levels-and-cashback",
      category: "bonuses",
      title: "VIP levels and cashback",
      excerpt:
        "Play earns experience points that raise your VIP level, and each level increases the share of activity returned as cashback.",
      body: [
        "Every settled bet adds experience points to your profile. Points accumulate across both casino and sports play and never decrease.",
        "Levels run from Bronze up to Diamond. The progress bar on the VIP page shows how far you are from the next tier and what that tier changes.",
        "The main benefit of a higher level is a larger cashback percentage, calculated on your activity over the period and credited automatically when the period closes.",
        "Higher tiers also unlock extra perks such as improved race positions and earlier access to seasonal promotions.",
        "Cashback is credited without a wagering requirement, so it behaves like ordinary balance from the moment it arrives.",
      ],
    },
    {
      slug: "how-to-place-a-bet",
      category: "sports",
      title: "How to place a sports bet",
      excerpt:
        "Tap any odds value to add a selection to the bet slip, type in your stake, and confirm the bet before the event starts.",
      body: [
        "Find your event in the sportsbook, either through the sport menu on the left or with the search box. Every market on the event page lists its selections with the current odds.",
        "Tapping an odds value adds that selection to the bet slip. The slip opens automatically and keeps its contents while you keep browsing for other markets.",
        "Enter a stake in the slip. The potential return is calculated live as stake multiplied by odds, and it updates instantly if the odds move while the slip is open.",
        "Confirm to place the bet. If the odds change between opening the slip and confirming, you are asked to accept the new price rather than having it applied silently.",
        "Placed bets appear under My bets, where you can follow the score and see the settlement once the event finishes.",
      ],
    },
    {
      slug: "what-is-an-accumulator",
      category: "sports",
      title: "What is an accumulator bet",
      excerpt:
        "An accumulator combines several selections into a single bet: the odds multiply together, but every leg has to win.",
      body: [
        "Add two or more selections to the bet slip and switch it to accumulator mode. One stake then covers the whole combination instead of each selection separately.",
        "The odds of the legs are multiplied, which is why a four-leg accumulator can pay far more than four single bets of the same total stake would.",
        "The trade-off is that one losing leg loses the entire bet. The more legs you add, the higher the return and the lower the chance of collecting it.",
        "Some markets from the same event cannot be combined, because their outcomes depend on each other. The slip flags those pairs and asks you to drop one of them.",
        "If a leg is voided, for instance when a match is postponed, that leg is treated as odds of one and the accumulator settles on the remaining selections.",
      ],
    },
    {
      slug: "odds-formats-explained",
      category: "sports",
      title: "Odds formats explained",
      excerpt:
        "Decimal, fractional and American odds all describe the same probability, and you can switch format in your settings.",
      body: [
        "Decimal odds show the total return per unit staked, the stake included. A selection at 2.50 returns two and a half units for every one staked, of which one and a half is profit.",
        "Fractional odds show profit against stake. The same selection is written as 3/2, meaning three units of profit for every two units risked.",
        "American odds use a positive number for the profit on a hundred-unit stake and a negative number for the stake needed to win a hundred. The same price appears as plus 150.",
        "Switching format changes only the presentation. The underlying price, and therefore the return, is identical in all three notations.",
        "The implied probability of a decimal price is one divided by the odds, which makes decimal the quickest format for comparing selections at a glance.",
      ],
    },
    {
      slug: "what-does-rtp-mean",
      category: "casino",
      title: "What does RTP mean",
      excerpt:
        "RTP is the long-run share of all wagers a game returns to players, measured over millions of rounds rather than one session.",
      body: [
        "RTP stands for return to player and is published as a percentage. A game listed at ninety-six percent returns ninety-six units for every hundred wagered, averaged over its full theoretical cycle.",
        "That average only appears over an enormous number of rounds. Any single session can land far above or far below it, and short-term results say nothing about whether a game is behaving correctly.",
        "Volatility is a separate property and is often more noticeable in play. Low volatility games pay small amounts often, high volatility games pay rarely but larger, and both can share the same RTP.",
        "The RTP of each title is shown in the game information panel, next to its provider and the range of stakes it accepts.",
      ],
    },
    {
      slug: "provably-fair-basics",
      category: "casino",
      title: "Provably fair basics",
      excerpt:
        "Provably fair games publish a hashed server seed and a client seed, so any round can be recalculated and checked later.",
      body: [
        "Before a round begins, the game commits to a server seed by publishing its hash. The hash reveals nothing about the seed itself but cannot be changed afterwards without breaking.",
        "Your client seed is combined with that server seed and a round counter to produce the result. Because you control part of the input, the outcome cannot be chosen for you in advance.",
        "When the seed pair is rotated, the original server seed is revealed. Hashing it yourself and comparing with the hash published earlier proves the seed was fixed before you played.",
        "With the revealed seed, the client seed and the counter, every round in that pair can be recomputed step by step and compared with the result you saw.",
        "Seeds can be rotated at any time from the fairness panel, and doing so regularly is good practice.",
      ],
    },
    {
      slug: "favorites-and-recently-played",
      category: "casino",
      title: "Favorites and recently played",
      excerpt:
        "Favorites keep the games you like one tap away, and the recently played row rebuilds your last session automatically.",
      body: [
        "The heart icon on any game tile adds that title to your favorites. The full list has its own tab in the casino lobby and is tied to your account rather than your device.",
        "Recently played is filled in automatically. Opening a game moves it to the front of the row, so the titles from your last session are always where you left them.",
        "Both lists sync across devices once you are signed in, which means a game favorited on a phone shows up on a desktop straight away.",
        "The row can be cleared from the lobby settings if you would rather not keep a visible history on shared devices.",
      ],
    },
    {
      slug: "two-factor-authentication",
      category: "security",
      title: "Setting up two-factor authentication",
      excerpt:
        "Two-factor authentication adds a rotating six-digit code to your login, so a stolen password on its own is not enough.",
      body: [
        "Open the security section of your settings and choose Enable two-factor authentication. A secret key and a QR code are displayed, both encoding the same value.",
        "Scan the code with any authenticator application that supports timed one-time passwords, then enter the six-digit code it generates to confirm that the clocks agree.",
        "Store the recovery codes shown during setup somewhere offline. They are the only way back into the account if you lose the device holding the authenticator.",
        "With two-factor enabled, a code is requested at sign-in and again when a withdrawal is confirmed, which are the two moments where it matters most.",
        "Turning the feature off requires a valid code, so an attacker who only knows your password cannot disable it either.",
      ],
    },
    {
      slug: "keeping-your-account-safe",
      category: "security",
      title: "Keeping your account safe",
      excerpt:
        "A unique password, a current email address and a healthy suspicion of unsolicited messages prevent almost every takeover.",
      body: [
        "Use a password that exists nowhere else. Most compromised accounts are not broken into directly; the credentials were reused from a service that leaked them.",
        "Staff never ask for your password, your two-factor codes or your recovery codes. Any message that does, whatever it looks like, is an attempt at fraud.",
        "Check the address bar before signing in. Links from chat rooms, comments and unexpected emails are the usual delivery route for copies of the login page.",
        "Review the active sessions list in your settings from time to time and end anything you do not recognise, then change your password if something looks wrong.",
        "Keep your email address current and secured with its own two-factor authentication, since whoever controls the mailbox controls password recovery.",
      ],
    },
  ],
  ru: [
    {
      slug: "how-to-create-account",
      category: "account",
      title: "Как создать аккаунт",
      excerpt:
        "Регистрация занимает около минуты: укажите почту и пароль, подтвердите возраст — и аккаунт готов к работе.",
      body: [
        "Форма регистрации открывается кнопкой в правом верхнем углу любой страницы. Понадобятся адрес электронной почты и пароль, а также есть необязательное поле для промокода, если он у вас уже есть.",
        "Выберите пароль не короче восьми символов, который вы не используете больше нигде. Сотрудники поддержки никогда не спрашивают пароль — ни в чате, ни по почте, поэтому любую такую просьбу считайте мошенничеством.",
        "Перед созданием аккаунта нужно подтвердить, что вы достигли совершеннолетия в своей стране и принимаете условия использования. Один человек может иметь только один аккаунт.",
        "Сразу после отправки формы вы попадаете в аккаунт. На указанную почту уходит письмо со ссылкой подтверждения — переход по ней открывает остальные возможности профиля.",
        "Если форма сообщает, что адрес уже занят, войдите под ним или воспользуйтесь ссылкой восстановления пароля на экране входа.",
      ],
    },
    {
      slug: "verify-your-email",
      category: "account",
      title: "Подтверждение адреса электронной почты",
      excerpt:
        "Подтверждённая почта открывает полный доступ к аккаунту, включает уведомления и даёт надёжный способ восстановить вход.",
      body: [
        "После регистрации на указанный адрес приходит письмо со ссылкой подтверждения. Ссылка действует двадцать четыре часа и срабатывает один раз.",
        "Если письмо не пришло за несколько минут, проверьте папки со спамом и рассылками, а затем запросите новую ссылку в профиле. Каждый новый запрос отменяет предыдущий.",
        "Именно подтверждённый адрес позволяет сбросить забытый пароль, получать предупреждения о новых входах и включить уведомления о рассчитанных ставках и завершённых операциях.",
        "Адрес можно сменить позже в настройках аккаунта. Новый адрес подтверждается точно так же, а до подтверждения продолжает работать прежний.",
      ],
    },
    {
      slug: "change-nickname-and-avatar",
      category: "account",
      title: "Как изменить никнейм и аватар",
      excerpt:
        "Никнейм и аватар видят другие игроки в таблицах лидеров; и то и другое меняется в настройках профиля.",
      body: [
        "Откройте страницу профиля и выберите «Редактировать профиль». В поле никнейма допускаются от трёх до шестнадцати символов: латинские буквы, цифры, подчёркивания и дефисы.",
        "Никнеймы уникальны, поэтому занятое имя форма отклонит с подсказкой. Имена, которые имитируют учётные записи сотрудников или содержат оскорбления, тоже не принимаются.",
        "Аватар выбирается из встроенной галереи. Отметьте плитку и сохраните форму — новая картинка появится везде, где показан ваш профиль, включая таблицы гонок и списки последних победителей.",
        "Изменения вступают в силу сразу, а сменить никнейм повторно можно после короткой паузы — так таблицы лидеров остаются читаемыми.",
      ],
    },
    {
      slug: "close-or-delete-account",
      category: "account",
      title: "Как закрыть или удалить аккаунт",
      excerpt:
        "Аккаунт можно временно заблокировать на период паузы или запросить полное удаление — оба варианта в настройках.",
      body: [
        "Самоисключение — обратимый вариант. Выберите срок и подтвердите его: на это время аккаунт блокируется, войти, делать ставки и открывать игры будет нельзя до окончания периода.",
        "Полное удаление запрашивается на том же экране. Оно стирает профиль, никнейм, настройки и историю, и после обработки отменить его невозможно.",
        "Прежде чем запрос на удаление примут, нужно завершить или отменить открытые ставки и незакрытые операции, поэтому сначала стоит заглянуть в кошелёк и историю ставок.",
        "Если вы хотите лишь прекратить получать сообщения, обычно достаточно отключить почтовые и push-уведомления в настройках — аккаунт при этом сохраняется.",
      ],
    },
    {
      slug: "how-to-make-a-deposit",
      category: "deposits",
      title: "Как пополнить баланс",
      excerpt:
        "Выберите монету и сеть, скопируйте показанный адрес и отправьте перевод со своего кошелька — баланс пополнится.",
      body: [
        "Откройте кошелёк и выберите «Пополнение». Укажите монету, затем сеть, по которой пойдёт перевод. После этого на экране появятся адрес пополнения и QR-код.",
        "Скопируйте адрес ровно в том виде, в каком он показан, или отсканируйте QR-код кошельком. Адреса создаются отдельно для каждой пары «монета — сеть», поэтому не используйте адрес от другой пары.",
        "Отправьте сумму со своего кошелька. Как только сеть наберёт нужное число подтверждений, платформа зачислит средства на баланс, и операция появится в истории кошелька.",
        "Пополнения меньше опубликованного минимума для монеты могут не зачисляться автоматически, а комиссию за перевод удерживает сама сеть, а не платформа.",
        "Это демонстрационный проект: балансы, адреса и операции здесь смоделированы, реальные средства не обрабатываются.",
      ],
    },
    {
      slug: "choosing-coin-and-network",
      category: "deposits",
      title: "Как выбрать монету и сеть",
      excerpt:
        "Одна и та же монета существует в нескольких сетях, и выбранная сеть должна совпадать с сетью отправляющего кошелька.",
      body: [
        "Стейблкоины особенно часто выпускаются сразу в нескольких блокчейнах. Один и тот же баланс можно перевести через TRC20, ERC20 или BEP20, и это три разные сети со своими адресами и комиссиями.",
        "Сначала задайте сеть на экране пополнения, а затем сверьте её с сетью, которую предлагает ваш кошелёк или биржа. Если они не совпадают, перевод не попадёт на нужный адрес.",
        "Сети различаются прежде всего скоростью и стоимостью. Переводы стейблкоинов по TRC20 обычно самые дешёвые, ERC20 обходится дороже всего, а такие сети, как Solana, подтверждаются за секунды.",
        "Перевод, отправленный по сети, которая не поддерживается для выбранной монеты, платформа вернуть не сможет: средства просто не попадают на подконтрольный ей адрес. Проверка пары занимает несколько секунд и полностью снимает этот риск.",
        "Это демонстрационный проект: балансы, адреса и операции здесь смоделированы, реальные средства не обрабатываются.",
      ],
    },
    {
      slug: "minimum-deposit-amounts",
      category: "deposits",
      title: "Минимальные суммы пополнения",
      excerpt:
        "У каждой монеты есть минимум пополнения, покрывающий сетевые издержки, и меньшие переводы могут не зачислиться.",
      body: [
        "Минимум показан на экране пополнения рядом с выбранной монетой и указан в самой монете, а не в фиатной валюте, поэтому он не меняется вместе с курсом.",
        "Минимумы существуют потому, что каждый входящий перевод нужно консолидировать в блокчейне, а это стоит сетевой комиссии. Перевод меньше комиссии обойдётся дороже, чем он сам стоит.",
        "Если отправить меньше минимума, сумма может оставаться необработанной до тех пор, пока следующие переводы на тот же адрес не поднимут итог выше порога.",
        "Один крупный перевод почти всегда выгоднее нескольких мелких: сетевая комиссия платится один раз, а не за каждую операцию.",
        "Это демонстрационный проект: балансы, адреса и операции здесь смоделированы, реальные средства не обрабатываются.",
      ],
    },
    {
      slug: "why-is-my-deposit-delayed",
      category: "deposits",
      title: "Почему задерживается пополнение",
      excerpt:
        "Чаще всего задержка связана с ожиданием подтверждений сети, низкой комиссией отправителя или неверно выбранной сетью.",
      body: [
        "Перевод виден только после того, как он попал в блок. Пока отправляющий кошелёк не выдал хеш транзакции, платформе просто нечего обнаруживать, сколько бы времени кошелёк ни показывал статус «отправлено».",
        "Для каждой монеты требуется определённое число подтверждений до зачисления. Загруженность блокчейна и низкая комиссия отправителя замедляют этот процесс, а некоторые сети медленнее по своей природе.",
        "Если транзакция подтверждена в сети, а баланс не изменился, самая частая причина — несовпадение сетей: монета отправлена по блокчейну, который не обслуживает выбранный адрес пополнения.",
        "Перед обращением в поддержку подготовьте хеш транзакции, монету, сеть и сумму. По хешу перевод отслеживается в публичном обозревателе блоков за пару минут.",
        "Это демонстрационный проект: балансы, адреса и операции здесь смоделированы, реальные средства не обрабатываются.",
      ],
    },
    {
      slug: "how-to-withdraw-funds",
      category: "withdrawals",
      title: "Как вывести средства",
      excerpt:
        "Откройте кошелёк, выберите «Вывод», вставьте адрес получателя, укажите подходящую сеть и подтвердите заявку.",
      body: [
        "В кошельке выберите «Вывод» и укажите монету. Вставьте адрес получателя из своего кошелька, а затем выберите сеть, к которой этот адрес относится.",
        "Введите сумму. На экране отображаются комиссия сети и точная сумма к получению, поэтому размер вывода можно скорректировать до подтверждения, а не удивляться результату после.",
        "Подтвердите заявку. Если включена двухфакторная аутентификация, на этом шаге запрашивается код — именно он не даёт распорядиться балансом тому, кто знает только пароль.",
        "Заявка появляется в истории кошелька с текущим статусом, а после отправки в сеть — и с хешем транзакции, который можно проверить в публичном обозревателе блоков.",
        "Это демонстрационный проект: балансы, адреса и операции здесь смоделированы, реальные средства не обрабатываются.",
      ],
    },
    {
      slug: "withdrawal-fees-explained",
      category: "withdrawals",
      title: "Из чего складывается комиссия за вывод",
      excerpt:
        "Комиссия за вывод покрывает отправку транзакции в сеть и зависит от выбранной монеты и от выбранного блокчейна.",
      body: [
        "Комиссия удерживается в той же монете, которую вы выводите, и показывается на экране подтверждения до того, как вы что-либо подтвердите.",
        "Основную её часть составляет плата самой сети за включение транзакции в блок — поэтому одна и та же монета в разных блокчейнах может стоить совершенно по-разному.",
        "Комиссия фиксированная, а не процентная, поэтому один крупный вывод выгоднее нескольких мелких: разбив сумму на четыре части, вы заплатите комиссию четыре раза.",
        "Бонусный баланс, по которому не закрыт отыгрыш, в доступную к выводу сумму не входит, поэтому максимум в форме может быть меньше общего баланса в кошельке.",
        "Это демонстрационный проект: балансы, адреса и операции здесь смоделированы, реальные средства не обрабатываются.",
      ],
    },
    {
      slug: "withdrawal-processing-times",
      category: "withdrawals",
      title: "Сколько времени занимает вывод",
      excerpt:
        "Заявку сначала проверяют, затем отправляют в сеть, поэтому итоговый срок зависит от блокчейна и текущей очереди.",
      body: [
        "Вывод проходит три этапа: автоматическая проверка, отправка транзакции в сеть и подтверждения, которые сеть должна набрать, прежде чем кошелёк получателя сочтёт перевод окончательным.",
        "Первый этап обычно самый быстрый, и большинство заявок проходят его без участия человека. Крупные суммы и новые адреса могут попасть на ручную проверку.",
        "После отправки в сеть время зависит только от блокчейна: быстрые сети рассчитываются за секунды, а перегруженные в часы пик могут занимать заметно дольше.",
        "История кошелька показывает текущий этап каждой заявки, а хеш транзакции появляется сразу после отправки перевода в сеть.",
        "Это демонстрационный проект: балансы, адреса и операции здесь смоделированы, реальные средства не обрабатываются.",
      ],
    },
    {
      slug: "why-is-my-withdrawal-pending",
      category: "withdrawals",
      title: "Почему вывод в статусе «в обработке»",
      excerpt:
        "Статус ожидания обычно означает плановую проверку, незакрытый отыгрыш бонуса или адрес, который нужно подтвердить.",
      body: [
        "«В обработке» означает лишь то, что заявка принята и ещё не отправлена в сеть. Пока она в этом статусе, ничего не теряется, и её можно отменить прямо в истории кошелька.",
        "Самая частая причина — активный бонус: пока отыгрыш не завершён, связанная часть баланса остаётся заблокированной и не может покинуть аккаунт.",
        "Новые адреса получателя и необычно крупные суммы запускают дополнительную проверку. Подтверждение заявки из письма или ввод кода двухфакторной аутентификации ускоряют её прохождение.",
        "Если заявка висит гораздо дольше сроков из статьи о времени обработки, отмените её и создайте заново, проверив, что адрес и сеть соответствуют друг другу.",
        "Это демонстрационный проект: балансы, адреса и операции здесь смоделированы, реальные средства не обрабатываются.",
      ],
    },
    {
      slug: "how-to-use-a-promo-code",
      category: "bonuses",
      title: "Как активировать промокод",
      excerpt:
        "Промокод вводится при регистрации или позже на странице бонусов, и награда начисляется на аккаунт сразу же.",
      body: [
        "В форме регистрации есть необязательное поле для промокода. Введённые там коды применяются, как только аккаунт создан.",
        "Если аккаунт уже есть, откройте страницу бонусов и воспользуйтесь полем промокода вверху. Регистр букв значения не имеет, а вот лишние пробелы при копировании приведут к ошибке.",
        "Каждый код активируется один раз на аккаунт и действует ограниченное время. Просроченные и уже использованные коды отклоняются с пояснением, а не молча.",
        "После успешной активации награда появляется в списке активных бонусов вместе с целью отыгрыша, полосой прогресса и датой сгорания.",
      ],
    },
    {
      slug: "wagering-requirements-explained",
      category: "bonuses",
      title: "Что такое отыгрыш бонуса",
      excerpt:
        "Отыгрыш — это общая сумма ставок, которую нужно сделать, прежде чем бонус превратится в обычный свободный баланс.",
      body: [
        "Бонус начисляется с множителем. Требование «двадцать пять раз» означает, что сумму бонуса нужно поставить в общей сложности двадцать пять раз, прежде чем она конвертируется.",
        "В зачёт идут только рассчитанные ставки. Отменённые ставки, аннулированные исходы и раунды с возвратом ставки прогресс не двигают.",
        "Разные типы игр могут учитываться с разным весом, и таблица вклада показана на карточке бонуса — по ней видно, какие игры продвигают отыгрыш быстрее всего.",
        "Прогресс в любой момент виден на странице бонусов. Пока цель не достигнута, бонусная часть баланса хранится отдельно и не выводится.",
      ],
    },
    {
      slug: "bonus-expiry-and-forfeiture",
      category: "bonuses",
      title: "Сгорание и отказ от бонуса",
      excerpt:
        "У каждого бонуса есть срок действия, и после его окончания остаток бонуса и прогресс отыгрыша списываются автоматически.",
      body: [
        "Дата сгорания указана на карточке бонуса с момента начисления, и отсчёт начинается именно тогда, а не с первой игры.",
        "Когда бонус сгорает, списываются оставшаяся бонусная сумма и привязанный к ней выигрыш. Баланс, по которому отыгрыш уже завершён, это не затрагивает.",
        "От бонуса можно отказаться и осознанно. Отказ на странице бонусов снимает требование отыгрыша сразу и разблокирует остальной баланс ценой самого бонуса.",
        "Одновременно активен только один бонус каждого типа. Новый бонус того же типа ждёт в очереди, пока текущий не будет завершён, отменён или не сгорит.",
      ],
    },
    {
      slug: "vip-levels-and-cashback",
      category: "bonuses",
      title: "VIP-уровни и кэшбэк",
      excerpt:
        "Игра приносит очки опыта, которые повышают VIP-уровень, а каждый уровень увеличивает долю возврата в виде кэшбэка.",
      body: [
        "Каждая рассчитанная ставка добавляет в профиль очки опыта. Очки копятся и в казино, и в ставках на спорт и никогда не уменьшаются.",
        "Уровни идут от «Бронзы» до «Алмаза». Полоса прогресса на странице VIP показывает, сколько осталось до следующего уровня и что он даёт.",
        "Главное преимущество высокого уровня — увеличенный процент кэшбэка. Он считается от вашей активности за период и начисляется автоматически при его закрытии.",
        "Старшие уровни открывают и дополнительные привилегии: улучшенные позиции в гонках и ранний доступ к сезонным акциям.",
        "Кэшбэк начисляется без требования отыгрыша, поэтому ведёт себя как обычный баланс с момента зачисления.",
      ],
    },
    {
      slug: "how-to-place-a-bet",
      category: "sports",
      title: "Как сделать ставку на спорт",
      excerpt:
        "Нажмите на коэффициент, чтобы добавить исход в купон, укажите сумму и подтвердите ставку до начала события.",
      body: [
        "Найдите событие в разделе спорта — через меню видов спорта слева или через поиск. На странице события каждый рынок показывает свои исходы с текущими коэффициентами.",
        "Нажатие на коэффициент добавляет исход в купон. Купон открывается сам и сохраняет содержимое, пока вы продолжаете просматривать другие рынки.",
        "Введите сумму в купоне. Возможный выигрыш пересчитывается на лету как сумма, умноженная на коэффициент, и обновляется, если коэффициент меняется при открытом купоне.",
        "Подтвердите ставку. Если коэффициент изменился между открытием купона и подтверждением, система попросит принять новую цену, а не применит её молча.",
        "Принятые ставки видны в разделе «Мои ставки», где можно следить за счётом и увидеть расчёт после окончания события.",
      ],
    },
    {
      slug: "what-is-an-accumulator",
      category: "sports",
      title: "Что такое экспресс",
      excerpt:
        "Экспресс объединяет несколько исходов в одну ставку: коэффициенты перемножаются, но выиграть должен каждый исход.",
      body: [
        "Добавьте в купон два и более исхода и переключите его в режим экспресса. Одна сумма тогда относится ко всей комбинации, а не к каждому исходу отдельно.",
        "Коэффициенты плеч перемножаются — поэтому экспресс из четырёх событий может принести гораздо больше, чем четыре ординара на ту же общую сумму.",
        "Обратная сторона в том, что один проигравший исход проигрывает всю ставку. Чем больше плеч, тем выше выплата и тем ниже шанс её получить.",
        "Некоторые рынки одного события нельзя объединять, потому что их исходы зависят друг от друга. Купон помечает такие пары и предлагает убрать одну из них.",
        "Если исход аннулирован, например при переносе матча, его коэффициент считается равным единице, и экспресс рассчитывается по оставшимся плечам.",
      ],
    },
    {
      slug: "odds-formats-explained",
      category: "sports",
      title: "Форматы коэффициентов",
      excerpt:
        "Десятичные, дробные и американские коэффициенты описывают одну вероятность, а формат переключается в настройках.",
      body: [
        "Десятичный коэффициент показывает полный возврат на единицу ставки вместе с самой ставкой. Исход с коэффициентом 2.50 возвращает две с половиной единицы на одну поставленную, из которых полторы — прибыль.",
        "Дробный формат показывает прибыль по отношению к ставке. Тот же исход записывается как 3/2: три единицы прибыли на каждые две единицы риска.",
        "Американский формат использует положительное число для прибыли со ставки в сто единиц и отрицательное для суммы, нужной ради выигрыша в сто. Та же цена выглядит как плюс 150.",
        "Переключение формата меняет только запись. Сама цена, а значит и выплата, во всех трёх нотациях одинакова.",
        "Подразумеваемая вероятность десятичного коэффициента равна единице, делённой на него, поэтому десятичный формат удобнее всего для быстрого сравнения исходов.",
      ],
    },
    {
      slug: "what-does-rtp-mean",
      category: "casino",
      title: "Что такое RTP",
      excerpt:
        "RTP — это доля всех ставок, которую игра возвращает игрокам на длинной дистанции, а не за одну игровую сессию.",
      body: [
        "RTP расшифровывается как «возврат игроку» и публикуется в процентах. Игра с показателем девяносто шесть процентов возвращает девяносто шесть единиц на каждые сто поставленных в среднем за полный теоретический цикл.",
        "Это среднее проявляется только на огромном числе раундов. Отдельная сессия может оказаться намного выше или ниже, и короткая серия ничего не говорит о корректности игры.",
        "Волатильность — отдельное свойство, и в игре она обычно заметнее. Низковолатильные игры платят часто и понемногу, высоковолатильные — редко и крупно, при этом RTP у них может совпадать.",
        "RTP каждой игры указан в информационной панели рядом с провайдером и диапазоном допустимых ставок.",
      ],
    },
    {
      slug: "provably-fair-basics",
      category: "casino",
      title: "Основы честности provably fair",
      excerpt:
        "Игры provably fair публикуют хеш серверного сида и клиентский сид, поэтому любой раунд можно пересчитать и проверить.",
      body: [
        "До начала раунда игра фиксирует серверный сид, публикуя его хеш. Хеш ничего не сообщает о самом сиде, но и подменить сид после публикации уже нельзя.",
        "Ваш клиентский сид объединяется с серверным сидом и счётчиком раундов, и из них получается результат. Поскольку часть входных данных задаёте вы, исход невозможно подобрать заранее.",
        "При смене пары сидов исходный серверный сид раскрывается. Если самостоятельно вычислить его хеш и сравнить с опубликованным ранее, видно, что сид был зафиксирован до вашей игры.",
        "Имея раскрытый сид, клиентский сид и счётчик, каждый раунд этой пары можно пересчитать шаг за шагом и сверить с тем результатом, который вы видели.",
        "Сиды можно менять в любой момент в панели честности, и делать это регулярно — хорошая привычка.",
      ],
    },
    {
      slug: "favorites-and-recently-played",
      category: "casino",
      title: "Избранное и недавно сыгранные",
      excerpt:
        "Избранное держит любимые игры в одно касание, а строка недавних сама восстанавливает вашу прошлую сессию.",
      body: [
        "Иконка сердца на плитке игры добавляет её в избранное. У полного списка есть отдельная вкладка в лобби казино, и он привязан к аккаунту, а не к устройству.",
        "Раздел недавних заполняется автоматически. Открытая игра перемещается в начало строки, поэтому игры прошлой сессии всегда там, где вы их оставили.",
        "Оба списка синхронизируются между устройствами после входа в аккаунт: игра, добавленная в избранное на телефоне, сразу появится на компьютере.",
        "Строку недавних можно очистить в настройках лобби, если вы не хотите оставлять видимую историю на общих устройствах.",
      ],
    },
    {
      slug: "two-factor-authentication",
      category: "security",
      title: "Настройка двухфакторной аутентификации",
      excerpt:
        "Двухфакторная аутентификация добавляет ко входу сменный шестизначный код, и одного украденного пароля становится мало.",
      body: [
        "Откройте раздел безопасности в настройках и выберите включение двухфакторной аутентификации. На экране появятся секретный ключ и QR-код — это одно и то же значение в двух видах.",
        "Отсканируйте код любым приложением-аутентификатором с поддержкой одноразовых паролей по времени, затем введите сгенерированный шестизначный код, чтобы подтвердить синхронность часов.",
        "Резервные коды, показанные при настройке, сохраните офлайн. Это единственный способ вернуться в аккаунт, если устройство с аутентификатором будет потеряно.",
        "При включённой двухфакторной защите код запрашивается при входе и повторно при подтверждении вывода — в двух самых важных точках.",
        "Отключение функции тоже требует действительного кода, поэтому злоумышленник, знающий только пароль, снять её не сможет.",
      ],
    },
    {
      slug: "keeping-your-account-safe",
      category: "security",
      title: "Как защитить свой аккаунт",
      excerpt:
        "Уникальный пароль, актуальная почта и здоровое недоверие к неожиданным сообщениям снимают почти все риски взлома.",
      body: [
        "Используйте пароль, которого нет больше нигде. Большинство скомпрометированных аккаунтов взламывают не напрямую: данные повторно используются из сервиса, который их потерял.",
        "Сотрудники никогда не просят пароль, коды двухфакторной аутентификации или резервные коды. Любое сообщение с такой просьбой, как бы оно ни выглядело, — попытка мошенничества.",
        "Проверяйте адресную строку перед входом. Ссылки из чатов, комментариев и неожиданных писем — обычный способ подсунуть копию страницы входа.",
        "Время от времени просматривайте список активных сессий в настройках и завершайте всё незнакомое, а затем меняйте пароль, если что-то выглядит подозрительно.",
        "Держите почтовый адрес актуальным и защитите его собственной двухфакторной аутентификацией: кто владеет почтой, тот управляет восстановлением пароля.",
      ],
    },
  ],
};

export interface BotReplyFixture {
  keywords: string[];
  reply: string;
}

export const BOT_REPLIES: Record<"en" | "ru", BotReplyFixture[]> = {
  en: [
    {
      keywords: ["deposit", "top up", "topup", "fund my account", "add funds"],
      reply:
        "To top up, open your wallet, choose Deposit, pick a coin and a network, and send to the address shown. The balance updates once the network confirms the transfer. See the Help Center for details.",
    },
    {
      keywords: ["withdraw", "withdrawal", "cash out", "payout"],
      reply:
        "Withdrawals start in the wallet under Withdraw: paste your address, pick the matching network and confirm. The fee and the exact amount you receive are shown before you confirm.",
    },
    {
      keywords: ["bonus", "free spins", "cashback", "reward"],
      reply:
        "Active bonuses, their wagering targets and their expiry dates all live on the bonuses page. Cashback is credited automatically when the period closes. See the Help Center for details.",
    },
    {
      keywords: ["promo code", "promocode", "coupon", "voucher", "code"],
      reply:
        "Enter promo codes during sign-up or in the box at the top of the bonuses page. Watch out for stray spaces when pasting, since they are the usual reason a valid code is rejected.",
    },
    {
      keywords: ["verify", "verification", "kyc", "confirm my email", "document"],
      reply:
        "Confirming your email is done from the link we send after registration, and you can request a new link from your profile at any time. See the Help Center for details.",
    },
    {
      keywords: ["password", "forgot", "reset", "cannot log in", "can't log in"],
      reply:
        "Use the recovery link on the login screen and a reset message goes to your confirmed email address. Pick a password you do not use anywhere else.",
    },
    {
      keywords: ["2fa", "two-factor", "two factor", "authenticator", "otp"],
      reply:
        "Two-factor authentication is switched on in the security section of your settings. Save the recovery codes offline, because they are the only way back in if you lose the device.",
    },
    {
      keywords: ["bet", "sports", "bet slip", "accumulator", "combo"],
      reply:
        "Tap any odds value to add a selection to the bet slip, enter a stake and confirm. Two or more selections can be combined into an accumulator, where every leg has to win.",
    },
    {
      keywords: ["odds", "decimal", "fractional", "american odds", "price"],
      reply:
        "You can switch between decimal, fractional and American odds in your settings. All three describe the same price, so only the presentation changes.",
    },
    {
      keywords: ["not loading", "won't load", "black screen", "stuck", "frozen"],
      reply:
        "A game that will not load usually clears after a page refresh, and switching off ad blockers for this site helps too. If it persists, tell me the game name and I will pass it on.",
    },
    {
      keywords: ["balance", "how much do i have", "my funds", "wallet"],
      reply:
        "Your balance is shown in the wallet, split into available funds and any bonus amount still under wagering. Only the available part can be withdrawn.",
    },
    {
      keywords: ["referral", "refer a friend", "invite", "affiliate"],
      reply:
        "Your personal referral link is on the referral page along with a live count of everyone who signed up through it. Share the link rather than the code for the cleanest tracking.",
    },
    {
      keywords: ["support", "agent", "human", "contact", "opening hours", "hours"],
      reply:
        "I am here around the clock, and the contact form on the support page reaches the team directly. Including your nickname and any transaction hash speeds up the reply.",
    },
    {
      keywords: ["language", "english", "russian", "translate", "switch language"],
      reply:
        "The language switcher sits in the header on every page and currently offers English and Russian. Your choice is remembered for the next visit.",
    },
  ],
  ru: [
    {
      keywords: ["депозит", "пополн", "внести", "закинуть", "положить"],
      reply:
        "Чтобы пополнить баланс, откройте кошелёк, выберите «Пополнение», укажите монету и сеть и отправьте перевод на показанный адрес. Баланс обновится, как только сеть подтвердит перевод. Подробнее — в Центре помощи.",
    },
    {
      keywords: ["вывод", "вывести", "снять", "выплат"],
      reply:
        "Вывод начинается в кошельке в разделе «Вывод»: вставьте адрес, выберите подходящую сеть и подтвердите заявку. Комиссия и точная сумма к получению видны до подтверждения.",
    },
    {
      keywords: ["бонус", "фриспин", "кэшбэк", "кешбэк", "награда"],
      reply:
        "Активные бонусы, цели отыгрыша и даты сгорания собраны на странице бонусов. Кэшбэк начисляется автоматически при закрытии периода. Подробнее — в Центре помощи.",
    },
    {
      keywords: ["промокод", "промо", "ваучер", "активировать код"],
      reply:
        "Промокод вводится при регистрации или в поле вверху страницы бонусов. Следите за лишними пробелами при вставке — именно из-за них чаще всего не срабатывает рабочий код.",
    },
    {
      keywords: ["верификац", "подтвердить почту", "kyc", "документ"],
      reply:
        "Почта подтверждается по ссылке из письма, которое приходит после регистрации, а новую ссылку можно запросить в профиле в любой момент. Подробнее — в Центре помощи.",
    },
    {
      keywords: ["пароль", "забыл", "восстанов", "не могу войти"],
      reply:
        "Воспользуйтесь ссылкой восстановления на экране входа — письмо со сбросом придёт на подтверждённый адрес. Выбирайте пароль, который вы больше нигде не используете.",
    },
    {
      keywords: ["2fa", "двухфактор", "аутентификатор", "одноразовый код"],
      reply:
        "Двухфакторная аутентификация включается в разделе безопасности в настройках. Сохраните резервные коды офлайн: без устройства это единственный способ вернуться в аккаунт.",
    },
    {
      keywords: ["ставк", "спорт", "поставить", "экспресс", "купон"],
      reply:
        "Нажмите на коэффициент, чтобы добавить исход в купон, укажите сумму и подтвердите. Два и более исхода объединяются в экспресс, где выиграть должно каждое плечо.",
    },
    {
      keywords: ["коэффициент", "кэф", "десятичн", "дробн", "формат котировок"],
      reply:
        "Переключить десятичные, дробные и американские коэффициенты можно в настройках. Все три формата описывают одну и ту же цену, меняется только запись.",
    },
    {
      keywords: ["не загружается", "не работает", "чёрный экран", "черный экран", "завис"],
      reply:
        "Игра, которая не загружается, обычно запускается после обновления страницы, и помогает отключение блокировщиков рекламы для сайта. Если не помогло, назовите игру — я передам информацию.",
    },
    {
      keywords: ["баланс", "средства", "сколько у меня", "кошелёк", "кошелек"],
      reply:
        "Баланс показан в кошельке и разделён на доступные средства и бонусную часть, по которой не закрыт отыгрыш. К выводу доступна только первая часть.",
    },
    {
      keywords: ["реферал", "пригласить", "друга", "партнёрск", "партнерск"],
      reply:
        "Персональная реферальная ссылка находится на странице рефералов вместе со счётчиком тех, кто зарегистрировался по ней. Делитесь именно ссылкой — так отслеживание точнее.",
    },
    {
      keywords: ["поддержк", "оператор", "связаться", "режим работы", "часы работы"],
      reply:
        "Я на связи круглосуточно, а форма обратной связи на странице поддержки идёт напрямую команде. Никнейм и хеш транзакции в сообщении заметно ускоряют ответ.",
    },
    {
      keywords: ["язык", "английск", "русск", "переключить язык", "перевод"],
      reply:
        "Переключатель языка есть в шапке на каждой странице, сейчас доступны английский и русский. Выбор запоминается до следующего визита.",
    },
  ],
};

export const BOT_GREETING: Record<"en" | "ru", string> = {
  en: "Hi! I am the support assistant. Ask me about deposits, withdrawals, bonuses or bets, and I will point you to the right answer.",
  ru: "Привет! Я помощник поддержки. Спросите про пополнение, вывод, бонусы или ставки — подскажу, где найти ответ.",
};

export const BOT_FALLBACK: Record<"en" | "ru", string> = {
  en: "Sorry, I did not quite catch that. Try rephrasing the question in a few words, or open the Help Center for the full article on the topic.",
  ru: "Извините, я не совсем понял вопрос. Попробуйте переформулировать его в паре слов или загляните в Центр помощи — там есть подробная статья по теме.",
};
