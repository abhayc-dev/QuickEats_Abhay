//! Categories Card (Inspiration for Your First Order)

const CategoryCard = ({ name, image, onClick }) => {
  return (
   <div className='w-[120px] h-[120px] md:w-[180px] md:h-[180px] rounded-2xl border-2 border-[#ff4d2d] shrink-0 overflow-hidden bg-white shadow-xl shadow-gray-100 hover:shadow-lg transition-shadow relative'
    onClick={onClick}>

  <img src={image} alt="" className='w-full h-full object-cover transform hover:scale-110 transition-transform duration-300'/>

  <div className='absolute bottom-1 m-3 w-full rounded-l-full rounded-r-full  px-3 py-1 text-center shadow text-sm font-medium text-gray-800 bg-white/80'>
    {name}
  </div>
  
</div>
  );
};

export default CategoryCard;
