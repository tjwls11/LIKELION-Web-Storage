import homeworkImg from '../ppt/웹스토리지-011.jpg'

export default function AllDoneScreen() {
  return (
    <div className="all-done-screen">
      <h1 className="all-done-title">실습 완료</h1>

      <img
        src={homeworkImg}
        alt="과제 안내"
        style={{ width: '100%', maxWidth: 1000, marginTop: 24 }}
      />
    </div>
  )
}
