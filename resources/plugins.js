const plugins = {
  test: {
    plug: ".test",
    desc: "اختبار عمل البوت",
  },
  privateMention: {
    plug: ".m",
    desc: "منشن خاص من البوت",
  },
  costumTextMention: {
    plug: ".#",
    desc: "إرسال منشن بنص مخصص",
  },
  classicMention: {
    plug: ".mention",
    desc: "منشن تقليدي باستخدام الأرقام",
  },
  sessionStop: {
    plug: ".stop",
    desc: "إيقاف الجلسة الحالية",
  },
  newSession: {
    plug: ".start",
    desc: "بدء جلسة جديدة",
  },
  removeSession: {
    plug: ".ds",
    desc: "حذف جلسة معينة",
  },
  runSession: {
    plug: ".ss",
    desc: "تشغيل جلسة معينة",
  },
  listSession: {
    plug: ".vs",
    desc: "عرض قائمة الجلسات المتوفرة",
  },
  cancelSession: {
    plug: ".cs",
    desc: "إلغاء طلب إنشاء جلسة",
  },
  getFilesSessions: {
    plug: ".idk",
    desc: "الاتصال بالكود الثماني",
  },
  listOfBlocked: {
    plug: ".vblocked",
    desc: "عرض قائمة المحظورين",
  },
  blockUser: {
    plug: ".block",
    desc: "حظر مستخدم",
  },
  unblockUser: {
    plug: ".unblock",
    desc: "إلغاء حظر مستخدم",
  },
  isLinked: {
    plug: ".numdevices",
    desc: "عرض عدد الأجهزة المرتبطة",
  },
  checkGroupLinked: {
    plug: ".groubnumdevices",
    desc: "عرض عدد الأجهزة المرتبطة بالمجموعة",
  },
  demoteUser: {
    plug: ".un",
    desc: "خفض رتبة مستخدم في المجموعة",
  },
  promoteUser: {
    plug: ".up",
    desc: "ترقية مستخدم في المجموعة",
  },
  kickUser: {
    plug: ".kick",
    desc: "طرد مستخدم من المجموعة",
  },
  generateLink: {
    plug: ".link",
    desc: "إنشاء رابط دعوة للمجموعة",
  },
  fetchGroupInfo: {
    plug: ".استدعاء",
    desc: "جلب معلومات المجموعة",
  },
  updateSubject: {
    plug: ".غير",
    desc: "تغيير اسم المجموعة",
  },
  modeSwitcher: {
    plug: ".تبديل",
    desc: "تبديل الأوضاع والإعدادات الأساسية",
  },
  demoteAll: {
    plug: ".unall",
    desc: "خفض رتبة جميع المشرفين",
  },
  lock: {
    plug: ".l",
    desc: "قفل المجموعة",
  },
  unlock: {
    plug: ".o",
    desc: "فتح المجموعة",
  },
  kickAll: {
    plug: ".اوت",
    desc: "طرد جميع أعضاء المجموعة",
  },
  menu: {
    plug: ".menu",
    desc: "عرض جميع أوامر البوت",
  },
};

module.exports = plugins;