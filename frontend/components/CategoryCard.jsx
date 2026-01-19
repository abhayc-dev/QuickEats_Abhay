//! Categories Card (Inspiration for Your First Order)

const CategoryCard = ({ name, image, onClick, isOpen = true }) => {
  return (
    <div className={`w-[120px] h-[120px] md:w-[180px] md:h-[180px] rounded-2xl border-2 shrink-0 overflow-hidden bg-white shadow-xl shadow-gray-100 hover:shadow-lg transition-all relative ${isOpen ? 'border-[#ff4d2d] cursor-pointer' : 'border-gray-300 cursor-not-allowed opacity-80'
      }`}
      onClick={isOpen ? onClick : null}>

      <img src={image} alt="" className={`w-full h-full object-cover transition-transform duration-300 ${isOpen ? 'hover:scale-110' : 'grayscale filter'}`} />

      {!isOpen && (
        <div className='absolute inset-0 bg-black/40 flex items-center justify-center z-10'>
          <span className='bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full'>CLOSED</span>
        </div>
      )}

      <div className='absolute bottom-1 m-3 w-full rounded-l-full rounded-r-full  px-3 py-1 text-center shadow text-sm font-medium text-gray-800 bg-white/80'>
        {name}
      </div>

    </div>
  );
};

export default CategoryCard;
