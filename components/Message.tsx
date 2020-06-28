import { motion } from 'framer-motion';

export default function Message() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <pre className='w-screen h-screen flex items-center justify-center'>Just Do It.</pre>
    </motion.div>
  );
}
